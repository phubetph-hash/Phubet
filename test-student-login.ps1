$testLogins = @(
    @{
        email = "somchai.j@ku.th"
        password = "123456"
        expectedRole = "student"
    },
    @{
        email = "phubet.ph@ku.th"
        password = "123456"
        expectedRole = "student"
    },
    @{
        email = "somying.r@ku.th"
        password = "123456"
        expectedRole = "student"
    }
)

$results = @()

foreach ($login in $testLogins) {
    $body = @{
        email = $login.email
        password = $login.password
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "http://localhost/project-advisor-system/backend/api/auth/login.php" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing `
            -ErrorAction Stop

        $data = $response.Content | ConvertFrom-Json

        $results += [PSCustomObject]@{
            Email = $login.email
            Status = $data.status
            Role = $data.data.role
            UserID = $data.data.user_id
            Success = ($data.status -eq "ok" -and $data.data.role -eq $login.expectedRole)
        }
    } catch {
        $results += [PSCustomObject]@{
            Email = $login.email
            Status = "error"
            Role = "N/A"
            UserID = "N/A"
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

Write-Host "`n=== Student Login Test Results ===" -ForegroundColor Cyan
$results | Format-Table -AutoSize

$passCount = ($results | Where-Object { $_.Success -eq $true }).Count
$totalCount = $results.Count

Write-Host "`nPassed: $passCount/$totalCount tests" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Yellow" })
