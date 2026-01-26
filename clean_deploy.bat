@echo off
echo ==========================================
echo    NexusPulse FINAL Deployment Script
echo ==========================================

echo 1. Cleaning up old Git configuration...
if exist .git (
    rmdir /s /q .git
    echo    Removed old .git directory.
)

echo.
echo 2. Initializing new Git repository...
git init

echo.
echo 3. Adding all files to staging...
git add .

echo.
echo 4. Committing changes...
git commit -m "final push from correct path"

echo.
echo 5. Setting branch to main...
git branch -M main

echo.
echo 6. Configuring remote repository...
git remote add origin https://github.com/chopinau/social-listening

echo.
echo 7. Pushing code to GitHub (Force Push)...
echo    (You may be asked to sign in to GitHub)
git push -u origin main --force

echo.
echo ==========================================
if %ERRORLEVEL% EQU 0 (
    echo    Deployment Successful!
) else (
    echo    Deployment Failed. Please check the errors above.
)
echo ==========================================
pause