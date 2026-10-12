@echo off
cd /d "%~dp0"
call npm run build
call npx firebase-tools login
call npx firebase-tools deploy
pause
