@echo off
title JRF OS Stopper
color 0C

echo =========================================
echo       Stopping JRF OS Local Server       
echo =========================================
echo.

echo [1/2] Stopping React Frontend (Node.js)...
taskkill /F /IM node.exe /T > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo - Frontend stopped successfully.
) else (
    echo - Frontend was not running.
)

echo.
echo [2/2] Stopping Spring Boot Backend (Java)...
taskkill /F /IM java.exe /T > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo - Backend stopped successfully.
) else (
    echo - Backend was not running.
)

echo.
echo =========================================
echo All JRF OS servers have been shut down!
echo =========================================
pause
