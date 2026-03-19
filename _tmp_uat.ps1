$base = "http://localhost/project-advisor-system/backend/api"

function Invoke-JsonRequest {
    param([string]$Method,[string]$Url,[Microsoft.PowerShell.Commands.WebRequestSession]$Session,[hashtable]$Headers,[object]$Body)
    $params = @{ Uri=$Url; Method=$Method; WebSession=$Session; UseBasicParsing=$true; ErrorAction='Stop' }
    if ($Headers) { $params.Headers = $Headers }
    if ($Body -ne $null) { $params.ContentType='application/json; charset=utf-8'; $params.Body=($Body | ConvertTo-Json -Depth 10) }
    try {
        $resp = Invoke-WebRequest @params
        return [pscustomobject]@{ StatusCode=[int]$resp.StatusCode; Json=($resp.Content | ConvertFrom-Json) }
    } catch {
        $status = 0; $json = $null
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode.value__
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $raw = $reader.ReadToEnd()
            if ($raw) { try { $json = $raw | ConvertFrom-Json } catch { $json = $raw } }
        }
        return [pscustomobject]@{ StatusCode=$status; Json=$json }
    }
}

function Get-CsrfToken {
    param([Microsoft.PowerShell.Commands.WebRequestSession]$Session)
    $resp = Invoke-JsonRequest -Method 'GET' -Url "$base/auth/csrf-token.php" -Session $Session -Headers @{} -Body $null
    return [pscustomobject]@{ StatusCode=$resp.StatusCode; Token=$resp.Json.data.token }
}

$results = @()

$studentSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$studentCsrf = Get-CsrfToken -Session $studentSession
$studentLogin = Invoke-JsonRequest -Method 'POST' -Url "$base/auth/login.php" -Session $studentSession -Headers @{ 'X-CSRF-Token' = $studentCsrf.Token } -Body @{ email='somchai.j@ku.th'; password='123456' }
$results += [pscustomobject]@{ Step='Student Login'; Status=$studentLogin.StatusCode; Ok=($studentLogin.StatusCode -eq 200) }

$studentProfile = Invoke-JsonRequest -Method 'GET' -Url "$base/students/get.php" -Session $studentSession -Headers @{} -Body $null
$results += [pscustomobject]@{ Step='Student Profile'; Status=$studentProfile.StatusCode; Ok=($studentProfile.StatusCode -eq 200) }

$advisors = Invoke-JsonRequest -Method 'GET' -Url "$base/advisors/list.php" -Session $studentSession -Headers @{} -Body $null
$terms = Invoke-JsonRequest -Method 'GET' -Url "$base/helpers/academic_terms.php" -Session $studentSession -Headers @{} -Body $null
$advisorId = if ($advisors.Json.data -and $advisors.Json.data.Count -gt 0) { [int]$advisors.Json.data[0].advisor_id } else { 0 }
$termId = if ($terms.Json.data -and $terms.Json.data.Count -gt 0) { [int]$terms.Json.data[0].academic_term_id } else { 0 }

$createNoCsrf = Invoke-JsonRequest -Method 'POST' -Url "$base/requests/create.php" -Session $studentSession -Headers @{} -Body @{ advisor_id=$advisorId; academic_term_id=$termId; project_title="UAT CSRF Test $(Get-Date -Format HHmmss)"; project_detail='csrf missing should fail' }
$results += [pscustomobject]@{ Step='CSRF Block (No Token)'; Status=$createNoCsrf.StatusCode; Ok=($createNoCsrf.StatusCode -eq 403) }

$createWithCsrf = Invoke-JsonRequest -Method 'POST' -Url "$base/requests/create.php" -Session $studentSession -Headers @{ 'X-CSRF-Token' = $studentCsrf.Token } -Body @{ advisor_id=$advisorId; academic_term_id=$termId; project_title="UAT Student Request $(Get-Date -Format HHmmss)"; project_detail='student full flow test from PowerShell' }
$results += [pscustomobject]@{ Step='Student Create Request'; Status=$createWithCsrf.StatusCode; Ok=($createWithCsrf.StatusCode -eq 200) }

$studentRequests = Invoke-JsonRequest -Method 'GET' -Url "$base/requests/list.php" -Session $studentSession -Headers @{} -Body $null
$results += [pscustomobject]@{ Step='Student Request List'; Status=$studentRequests.StatusCode; Ok=($studentRequests.StatusCode -eq 200) }

$advisorSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$advisorCsrf = Get-CsrfToken -Session $advisorSession
$advisorLogin = Invoke-JsonRequest -Method 'POST' -Url "$base/auth/login.php" -Session $advisorSession -Headers @{ 'X-CSRF-Token' = $advisorCsrf.Token } -Body @{ email='advisor1@ku.ac.th'; password='123456' }
$results += [pscustomobject]@{ Step='Advisor Login'; Status=$advisorLogin.StatusCode; Ok=($advisorLogin.StatusCode -eq 200) }
$advisorProfile = Invoke-JsonRequest -Method 'GET' -Url "$base/advisors/get.php" -Session $advisorSession -Headers @{} -Body $null
$results += [pscustomobject]@{ Step='Advisor Profile'; Status=$advisorProfile.StatusCode; Ok=($advisorProfile.StatusCode -eq 200) }
$advisorRequests = Invoke-JsonRequest -Method 'GET' -Url "$base/requests/list.php?limit=5" -Session $advisorSession -Headers @{} -Body $null
$results += [pscustomobject]@{ Step='Advisor Request List'; Status=$advisorRequests.StatusCode; Ok=($advisorRequests.StatusCode -eq 200) }

$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminCsrf = Get-CsrfToken -Session $adminSession
$adminLogin = Invoke-JsonRequest -Method 'POST' -Url "$base/auth/login.php" -Session $adminSession -Headers @{ 'X-CSRF-Token' = $adminCsrf.Token } -Body @{ email='admin@ku.ac.th'; password='123456' }
$results += [pscustomobject]@{ Step='Admin Login'; Status=$adminLogin.StatusCode; Ok=($adminLogin.StatusCode -eq 200) }
$adminStats = Invoke-JsonRequest -Method 'GET' -Url "$base/admin/dashboard/stats.php" -Session $adminSession -Headers @{} -Body $null
$results += [pscustomobject]@{ Step='Admin Dashboard Stats'; Status=$adminStats.StatusCode; Ok=($adminStats.StatusCode -eq 200) }
$adminUsers = Invoke-JsonRequest -Method 'GET' -Url "$base/admin/users/list.php?role=all" -Session $adminSession -Headers @{} -Body $null
$results += [pscustomobject]@{ Step='Admin Users List'; Status=$adminUsers.StatusCode; Ok=($adminUsers.StatusCode -eq 200) }

$passCount = ($results | Where-Object { $_.Ok }).Count
[pscustomobject]@{
  passed = $passCount
  total = $results.Count
  allPassed = ($passCount -eq $results.Count)
  studentCreateStatus = $createWithCsrf.StatusCode
  studentCreateMessage = ($createWithCsrf.Json.message)
  csrfNegativeStatus = $createNoCsrf.StatusCode
  csrfNegativeMessage = ($createNoCsrf.Json.message)
  results = $results
} | ConvertTo-Json -Depth 6
