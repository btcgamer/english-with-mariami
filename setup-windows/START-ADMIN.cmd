@echo off
chcp 65001 >nul
cd /d "%~dp0"
py -3 --version >nul 2>&1
if not errorlevel 1 goto use_py
python --version >nul 2>&1
if not errorlevel 1 goto use_python
echo Python 3 is required. Install it from https://www.python.org/downloads/windows/
goto done
:use_py
py -3 -X utf8 setup_admin.py
goto done
:use_python
python -X utf8 setup_admin.py
:done
echo.
pause
