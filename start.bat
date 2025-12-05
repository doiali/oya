@echo off
setlocal

REM --- Backend: use venv python to run uvicorn in a new window ---
if not exist "%~dp0oya-back\venv\Scripts\python.exe" (
  echo Backend venv not found. Run build.bat first.
  pause
  exit /b 1
)

echo Starting backend...
start "Oya - Backend" /D "%~dp0oya-back" "%~dp0oya-back\venv\Scripts\python.exe" -m uvicorn app.main:app --reload

REM --- Frontend: serve the production build in a new window ---
if not exist "%~dp0oya-web\build" (
  echo Frontend build not found. Run build.bat first.
  pause
  exit /b 1
)

echo Starting frontend (serve -s build)...
start "Oya - Frontend" /D "%~dp0oya-web" cmd /k "serve -s build -l 5000"

echo Both servers started (each in its own window).
start "" "http://localhost:5000"
endlocal