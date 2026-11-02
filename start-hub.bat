@echo off
chcp 65001 >nul
set "NODE_EXE="
where node >nul 2>nul
if not errorlevel 1 set "NODE_EXE=node"
if not defined NODE_EXE (
  for /d %%d in ("%USERPROFILE%\.workbuddy\binaries\node\versions\*") do if exist "%%d\node.exe" set "NODE_EXE=%%d\node.exe"
)
if not defined NODE_EXE (
  if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
)
if not defined NODE_EXE (
  if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
)
if not defined NODE_EXE (
  echo Node not found. Opening download page...
  start https://nodejs.org
  pause
  exit /b
)
echo Starting AI-ing Hub and opening browser...
echo Keep this window open (minimize is fine).
timeout /t 1 >nul
start http://127.0.0.1:54321
"%NODE_EXE%" "%~dp0server.js"
pause
