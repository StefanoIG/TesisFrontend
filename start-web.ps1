# Start Expo Web Server
$currentDir = Get-Location
Set-Location "C:\Users\StefanoIG\Desktop\Tesis\trazabilidad-app"

Write-Host "Starting Expo Web Server..." -ForegroundColor Green
Write-Host "Navigate to http://localhost:8081 to see your app" -ForegroundColor Cyan

npm run web

Set-Location $currentDir
