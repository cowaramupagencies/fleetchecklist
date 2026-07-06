@echo off
cd /d "%~dp0"
echo Preparing GitHub upload folder...
call npm.cmd run github-upload
if errorlevel 1 (
  echo Failed.
  pause
  exit /b 1
)
echo.
echo Open the "GitHub upload" folder and upload ALL of it to GitHub.
explorer "%~dp0GitHub upload"
pause
