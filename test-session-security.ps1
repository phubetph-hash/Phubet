# PowerShell Session Security Test Script
# Test session persistence and security

Write-Host "=== Session Security Testing ===" -ForegroundColor Green

# Create a session container for cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$baseUrl = "http://localhost/project-advisor-system/backend"
$headers = @{
    'Origin' = 'http://localhost:3000'
    'Content-Type' = 'application/json'
}

# Test 1: Login and get session
Write-Host "`n1. Testing Login..." -ForegroundColor Yellow
$loginData = @{
    email = 'somchai.j@ku.th'
    password = '1234567'
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Headers $headers -Body $loginData -WebSession $session
    $loginResult = $response.Content | ConvertFrom-Json
    Write-Host "Login Success: $($loginResult.success)" -ForegroundColor Green
} catch {
    Write-Host "Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Check session immediately after login
Write-Host "`n2. Testing Session Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/check-session" -Headers $headers -WebSession $session
    $sessionResult = $response.Content | ConvertFrom-Json
    Write-Host "Session Active: $($sessionResult.authenticated)" -ForegroundColor Green
    Write-Host "User Role: $($sessionResult.role)" -ForegroundColor Cyan
} catch {
    Write-Host "Session Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test protected endpoint
Write-Host "`n3. Testing Protected Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/requests/list" -Headers $headers -WebSession $session
    $requestsResult = $response.Content | ConvertFrom-Json
    Write-Host "Protected Endpoint Access: Success" -ForegroundColor Green
    Write-Host "Request Count: $($requestsResult.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "Protected Endpoint Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test without session (new session container)
Write-Host "`n4. Testing Without Session..." -ForegroundColor Yellow
$newSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/requests/list" -Headers $headers -WebSession $newSession
    Write-Host "Unauthorized Access: SECURITY ISSUE!" -ForegroundColor Red
} catch {
    Write-Host "Unauthorized Access Blocked: Good" -ForegroundColor Green
}

# Test 5: Test logout
Write-Host "`n5. Testing Logout..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/logout" -Method POST -Headers $headers -WebSession $session
    $logoutResult = $response.Content | ConvertFrom-Json
    Write-Host "Logout Success: $($logoutResult.success)" -ForegroundColor Green
} catch {
    Write-Host "Logout Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Check session after logout
Write-Host "`n6. Testing Session After Logout..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/check-session" -Headers $headers -WebSession $session
    $sessionResult = $response.Content | ConvertFrom-Json
    Write-Host "Session Active After Logout: $($sessionResult.authenticated)" -ForegroundColor $(if($sessionResult.authenticated) { "Red" } else { "Green" })
} catch {
    Write-Host "Session Check After Logout Failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green