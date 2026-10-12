@echo off
cd /d "%~dp0"
if not exist scripts\serviceAccountKey.json (
  echo Put your serviceAccountKey.json file inside the scripts folder first.
  pause
  exit /b
)
call npm run create-users
echo.
echo When this works you can delete scripts\serviceAccountKey.json
pause
