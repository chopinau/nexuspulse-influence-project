@echo off
echo ==========================================
echo       NexusPulse Deployment Script
echo ==========================================

echo 1. Checking Git initialization...
if not exist .git (
    echo    Initializing new Git repository...
    git init
) else (
    echo    Git repository already exists.
)

echo.
echo 2. Adding all files to staging...
git add .

echo.
echo 3. Committing changes...
git commit -m "ready for deployment"

echo.
echo 4. Setting branch to main...
git branch -M main

echo.
echo 5. Configuring remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/chopinau/social-listening

echo.
echo 6. Pushing code to GitHub...
echo    (You may be asked to sign in to GitHub)
git push -u origin main

echo.
echo ==========================================
if %ERRORLEVEL% EQU 0 (
    echo    Deployment Successful!
) else (
    echo    Deployment Failed. Please check the errors above.
)
echo ==========================================
pause