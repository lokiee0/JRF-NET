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
echo [3/3] Waiting for servers to boot (15 seconds)...
timeout /t 15 /nobreak > nul

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
