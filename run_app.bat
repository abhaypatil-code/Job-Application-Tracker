@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo    Job Application Tracker (Electron)
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] dependencies not found. Installing...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully.
)

:: Run the application
echo [INFO] Starting Job Application Tracker...
call npm run electron:dev

if %errorlevel% neq 0 (
    echo [ERROR] Application crashed or failed to start.
    pause
) else (
    echo Application closed.
)
endlocal