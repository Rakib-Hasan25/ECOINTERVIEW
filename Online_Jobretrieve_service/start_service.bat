@echo off
echo.
echo ======================================================================
echo  STARTING ONLINE JOB RETRIEVE SERVICE
echo ======================================================================
echo.

cd /d "%~dp0"

echo [INFO] Starting server on port 5002...
echo [INFO] API will be available at http://localhost:5002/api/jobs
echo.

python app.py

pause
