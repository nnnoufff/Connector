@echo off
cd /d "%~dp0"
echo === Connector: create local repo and push to GitHub ===
where git >nul 2>nul || (echo Git is not installed: https://git-scm.com/download/win & pause & exit /b 1)
for /f "delims=" %%a in ('git config user.name') do set GN=%%a
if "%GN%"=="" (echo Set your identity first:  git config --global user.name "Your Name"  and  git config --global user.email "you@example.com" & pause & exit /b 1)
if not exist .git git init -b main
git add .
echo.
echo Checking that no private file is tracked...
git ls-files | findstr /i "\.env$ \.env\.local cz.glb michelle.glb" && (echo STOP: a private file is tracked. & pause & exit /b 1)
git commit -m "Initial commit: Connector, communication without barriers"
echo.
echo 1) On github.com create an EMPTY repo named connect-accessibility (no README, no .gitignore, no licence). Keep it Private until you check the licences.
set /p URL=2) Paste the repo URL (https://github.com/USER/connect-accessibility.git): 
git remote remove origin 2>nul
git remote add origin %URL%
git push -u origin main
pause
