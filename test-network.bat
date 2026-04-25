@echo off
cls
echo ============================================
echo   Testing FlexyFuel Backend Connection
echo ============================================
echo.
echo Step 1: Finding your IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set ip=%%a
    setlocal enabledelayedexpansion
    set ip=!ip:~1!
    echo    Found IP: !ip!
    endlocal
)

echo.
echo Step 2: Testing localhost backend...
curl -s http://localhost:3002/health
echo.
echo.
echo Step 3: Add Firewall Rule (Run as Administrator)
echo Copy and run this in PowerShell as Admin:
echo.
echo New-NetFirewallRule -DisplayName "FlexyFuel Backend Port 3002" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3002
echo.
echo ============================================
pause
