@echo off
setlocal

REM --- check for Python 3.10 ---
py -3.10 -V >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ERROR: Python 3.10 not found. Install Python 3.10 or configure the py launcher.
  pause
  exit /b 1
)

REM --- check for Node ---
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ERROR: Node.js not found. Install Node.js >=16.13.0.
  pause
  exit /b 1
)

REM --- check for Yarn (don't auto-install globally) ---
yarn -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Yarn not found. Please install Yarn globally: npm install -g yarn
  pause
  exit /b 1
)

echo.
echo ===== Backend: preparing virtual environment =====
cd /d "%~dp0oya-back" || (echo Cannot find oya-back folder & pause & exit /b 1)

if not exist "venv" (
  py -3.10 -m venv venv
  if %ERRORLEVEL% neq 0 (echo Failed to create venv & pause & exit /b 1)
) else (
  echo venv already exists, skipping creation.
)

call "venv\Scripts\activate"
if %ERRORLEVEL% neq 0 (echo Failed to activate venv & pause & exit /b 1)

REM Use the venv python explicitly to avoid calling system Python
set "VENV_PY=%~dp0oya-back\venv\Scripts\python.exe"
if not exist "%VENV_PY%" (
  echo venv python not found at %VENV_PY% & pause & exit /b 1
)

echo Installing Python requirements...
"%VENV_PY%" -m pip install --upgrade pip
"%VENV_PY%" -m pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (echo pip install failed & pause & exit /b 1)

echo Running database migrations (alembic upgrade head) using venv python...
"%VENV_PY%" -m alembic upgrade head
if %ERRORLEVEL% neq 0 (
  echo Alembic migration failed. Check configuration.
  pause
  exit /b 1
)

echo.
echo ===== Frontend: building production assets =====
cd /d "%~dp0oya-web" || (echo Cannot find oya-web folder & pause & exit /b 1)

echo Installing node modules...
yarn install --frozen-lockfile
if %ERRORLEVEL% neq 0 (echo yarn install failed & pause & exit /b 1)

echo Building frontend...
yarn build
if %ERRORLEVEL% neq 0 (echo yarn build failed & pause & exit /b 1)

echo.
echo Build complete.
pause
endlocal