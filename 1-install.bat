@echo off
cd /d "%~dp0"
call npm install
echo.
echo Done. Next: put serviceAccountKey.json in the scripts folder, then run 2-create-users.bat
pause
