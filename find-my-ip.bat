@echo off
cls
echo ============================================
echo   FlexyFuel - Find Your Computer's IP
echo ============================================
echo.
echo Your WiFi IP Address:
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set ip=%%a
    setlocal enabledelayedexpansion
    set ip=!ip:~1!
    echo    !ip!
    endlocal
)

echo.
echo ============================================
echo   Next Steps:
echo ============================================
echo 1. Copy one of the IP addresses above
echo    (Usually starts with 192.168 or 172.20)
echo.
echo 2. Open: config\api.config.ts
echo.
echo 3. Change LOCAL_IP to your IP:
echo    const LOCAL_IP = 'YOUR_IP_HERE';
echo.
echo 4. Save and restart the app
echo ============================================
echo.
echo Backend Server: http://localhost:3000
echo App should use: http://YOUR_IP:3000
echo.
pause
