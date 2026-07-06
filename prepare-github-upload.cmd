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
echo Done! Upload everything inside the "GitHub upload" folder to GitHub.
explorer "%~dp0GitHub upload"
pause
