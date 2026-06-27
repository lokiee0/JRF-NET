@echo off
title JRF OS Launcher
color 0A

echo =========================================
echo       Starting JRF OS Local Server
echo =========================================
echo.

:: Get the directory where this bat file lives
set "ROOT_DIR=%~dp0"
set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "JRF OS Backend" cmd /k "cd /d "%ROOT_DIR%\backend" && mvnw.cmd spring-boot:run"

echo [2/3] Starting React Frontend (Port 5173)...
start "JRF OS Frontend" cmd /k "cd /d "%ROOT_DIR%\frontend" && npm run dev"

echo.
echo [3/3] Waiting for backend to be ready (polling health check)...

setlocal enabledelayedexpansion
set "RETRY_COUNT=0"
set "MAX_RETRIES=60"

:health_check
if !RETRY_COUNT! geq !MAX_RETRIES! (
    echo WARNING: Backend did not respond after 60 seconds. Proceeding anyway...
    goto open_browser
)

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/health' -TimeoutSec 2 -ErrorAction Stop; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    echo - Backend is ready!
    goto open_browser
)

set /a RETRY_COUNT+=1
echo - Attempt !RETRY_COUNT!/!MAX_RETRIES!: Backend not ready yet, retrying in 1 second...
timeout /t 1 /nobreak > nul
goto health_check

:open_browser
echo Opening JRF OS in your default browser...
start http://localhost:5173

echo.
echo =========================================
echo   JRF OS is running!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo =========================================
echo.
echo Keep the two terminal windows open while studying.
echo Run Stop-JRF-OS.bat to shut everything down.
pause
