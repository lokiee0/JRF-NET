@echo off
title JRF OS Stopper
color 0C

echo =========================================
echo       Stopping JRF OS Local Server       
echo =========================================
echo.

echo [1/2] Attempting graceful backend shutdown...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080/actuator/shutdown' -Method POST -TimeoutSec 5 -ErrorAction Stop | Out-Null; Write-Host '- Backend shutdown initiated.'; exit 0 } catch { exit 1 }" 2>nul

if %ERRORLEVEL% EQU 0 (
    timeout /t 2 /nobreak > nul
) else (
    echo - Graceful shutdown endpoint not available, attempting port-based termination...
    
    REM Try to find and kill process on port 8080 (backend)
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 "') do (
        taskkill /PID %%a /T /GRACESHUTDOWN 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo - Backend process terminated gracefully.
            timeout /t 1 /nobreak > nul
        ) else (
            echo - Forcing backend termination...
            taskkill /PID %%a /F 2>nul
        )
    )
)

echo.
echo [2/2] Stopping React Frontend (Node.js on port 5173)...

REM Try to find and kill process on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
    taskkill /PID %%a /T /GRACESHUTDOWN 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo - Frontend process terminated gracefully.
    ) else (
        echo - Forcing frontend termination...
        taskkill /PID %%a /F 2>nul
    )
)

echo.
echo =========================================
echo All JRF OS servers have been shut down!
echo =========================================
pause
