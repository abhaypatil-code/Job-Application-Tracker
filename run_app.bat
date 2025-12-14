@echo off
echo Starting the Job Application Tracker...
start cmd /k "cd /d d:\Software\JOB CORNER\Job-Application-Tracker && npm run dev"
timeout /t 10 /nobreak > nul
start http://localhost:5173
echo Application opened in browser.