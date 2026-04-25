# Get WiFi IP Address
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Your Computer's IP Address" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -ne "127.0.0.1" } |
    Select-Object IPAddress, InterfaceAlias

foreach ($ip in $ipAddresses) {
    Write-Host "$($ip.InterfaceAlias): " -NoNewline -ForegroundColor Yellow
    Write-Host "$($ip.IPAddress)" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Use the WiFi IP address above" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
