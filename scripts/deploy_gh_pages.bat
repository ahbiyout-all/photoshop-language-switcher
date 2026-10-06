@echo off
setlocal enabledelayedexpansion

:: =========================================================================
::  Adobe Photoshop & Illustrator Language Switcher
::  GitHub Pages Deployment Automation Script (Windows CRLF)
::
::  Developer: AhBiYout
::  Official Google Blog: https://ahbiyoutvibe.blogspot.com/
::  Organization: https://www.cisnet.co.kr (CIS)
::  Copyright (C) 2026 AhBiYout. All rights reserved.
:: =========================================================================

title Adobe Language Switcher - GitHub Pages Deployment

echo =========================================================================
echo   Adobe Photoshop ^& Illustrator Language Switcher
echo   GitHub Pages One-Click Deployment Automation (Windows CRLF)
echo.
echo   Developer : AhBiYout
echo   Blog      : https://ahbiyoutvibe.blogspot.com/
echo   Org       : https://www.cisnet.co.kr
echo =========================================================================
echo.

:: Change working directory to project root if executed from scripts directory
if exist "..\package.json" (
    cd ..
)

:: -------------------------------------------------------------------------
:: Step 1: Check Environment Prerequisites
:: -------------------------------------------------------------------------
echo [Step 1/5] Checking environment prerequisites...

:: 1-1. Detect or Locate Git (Auto-scan standard Windows install directories)
set "GIT_FOUND=0"
where git >nul 2>&1
if !errorlevel! equ 0 (
    set "GIT_FOUND=1"
) else (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=C:\Program Files\Git\cmd;!PATH!"
        set "GIT_FOUND=1"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;!PATH!"
        set "GIT_FOUND=1"
    ) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
        set "PATH=C:\Program Files (x86)\Git\cmd;!PATH!"
        set "GIT_FOUND=1"
    ) else if exist "C:\Git\cmd\git.exe" (
        set "PATH=C:\Git\cmd;!PATH!"
        set "GIT_FOUND=1"
    )
)

if "!GIT_FOUND!"=="1" goto :git_check_done

echo.
echo =========================================================================
echo [PREREQUISITE NOTICE] Git is not installed or not found in system PATH.
echo Git is required to sync source code and deploy to GitHub Pages.
echo =========================================================================
echo.

where winget >nul 2>&1
if !errorlevel! neq 0 goto :manual_git_install

echo Windows Package Manager [winget] detected on this computer!
echo You can automatically install Git now in one click:
echo   Command: winget install --id Git.Git -e --source winget
echo.
set "AUTO_GIT=Y"
set /p AUTO_GIT="Auto-install Git for Windows now? [Y/N, default Y]: "
if /i "!AUTO_GIT!"=="N" goto :manual_git_install

echo.
echo -- Installing Git for Windows via winget (please allow any Windows UAC prompt)...
winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
if exist "C:\Program Files\Git\cmd" set "PATH=C:\Program Files\Git\cmd;!PATH!"
if exist "%LOCALAPPDATA%\Programs\Git\cmd" set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;!PATH!"
where git >nul 2>&1
if !errorlevel! equ 0 (
    echo [SUCCESS] Git installed and configured for this session!
    set "GIT_FOUND=1"
    goto :git_check_done
)

echo.
echo [NOTICE] Git installation finished!
echo To finalize environment variables, please close and restart this script:
echo   deploy_gh_pages.bat
echo.
pause
exit /b 0

:manual_git_install
echo.
echo Manual Git Installation Guide:
echo 1. Download official installer from: https://git-scm.com/download/win
echo 2. Run the installer and keep standard options.
echo 3. Re-run this deploy script once installed.
echo.
set "OPEN_GIT_URL=Y"
set /p OPEN_GIT_URL="Open Git download page in your browser? [Y/N, default Y]: "
if /i not "!OPEN_GIT_URL!"=="N" (
    start https://git-scm.com/download/win
)
goto :deploy_failed

:git_check_done
echo -- Git detected:
for /f "tokens=*" %%G in ('git --version 2^>nul') do echo    %%G

:: 1-2. Detect Node.js and npm (Optional for Method 1 GitHub Actions, Required for Method 2)
set "NODE_FOUND=0"
where node >nul 2>&1
if !errorlevel! equ 0 (
    set "NODE_FOUND=1"
) else (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;!PATH!"
        set "NODE_FOUND=1"
    )
)

if "!NODE_FOUND!"=="1" (
    echo -- Node.js and npm detected.
) else (
    echo -- [NOTE] Local Node.js not detected.
    echo    - Method 1: GitHub Actions CI/CD compiles in the cloud without local Node.js.
)
echo.

:: -------------------------------------------------------------------------
:: Step 2: Read Version & Git Remote
:: -------------------------------------------------------------------------
echo [Step 2/5] Reading application version and Git status...
set "APP_VERSION="
for /f "tokens=*" %%V in ('powershell -NoProfile -Command "(Get-Content package.json -Raw | ConvertFrom-Json).version" 2^>nul') do (
    set "APP_VERSION=%%V"
)
if "%APP_VERSION%"=="" (
    for /f "tokens=*" %%V in ('node -p "require('./package.json').version" 2^>nul') do (
        set "APP_VERSION=%%V"
    )
)
if "%APP_VERSION%"=="" (
    set "APP_VERSION=2.12.2"
)
set "APP_TAG=v%APP_VERSION%"
echo -- Release Version: %APP_VERSION% (%APP_TAG%)

if not exist ".git\" (
    echo -- Initializing new Git repository with default branch 'main'...
    git init -b main >nul 2>&1
    if !errorlevel! neq 0 (
        git init >nul 2>&1
        git branch -M main >nul 2>&1
    )
)

:setup_remote_flow
set "CURRENT_ORIGIN="
for /f "tokens=*" %%R in ('git remote get-url origin 2^>nul') do set "CURRENT_ORIGIN=%%R"

echo.
echo =========================================================================
echo [STEP 2/5] GitHub Remote Repository Setup ^& Verification
echo =========================================================================
if not "!CURRENT_ORIGIN!"=="" (
    echo Current Configured Remote URL:
    echo   !CURRENT_ORIGIN!
    echo =========================================================================
    echo.
    echo Which GitHub repository do you want to push to?
    echo.
    echo   [1] Connect to 'ahbiyout-all' (Recommended - GitHub Username)
    echo       URL: https://github.com/ahbiyout-all/photoshop-language-switcher.git
    echo.
    echo   [2] Connect to 'ahbiyout' (Account Name)
    echo       URL: https://github.com/ahbiyout/photoshop-language-switcher.git
    echo.
    echo   [3] Enter custom GitHub repository URL directly (Paste from browser)
    echo.
    echo   [4] Keep current URL (!CURRENT_ORIGIN!) and continue
    echo.
    echo   [5] Cancel deployment
    echo.
    set "SETUP_CHOICE=1"
    if "!CURRENT_ORIGIN!"=="https://github.com/ahbiyout-all/photoshop-language-switcher.git" set "SETUP_CHOICE=4"
    if "!CURRENT_ORIGIN!"=="https://github.com/ahbiyout/photoshop-language-switcher.git" set "SETUP_CHOICE=4"
    set /p SETUP_CHOICE="Select option [1-5, default !SETUP_CHOICE!]: "
    if "!SETUP_CHOICE!"=="5" goto :deploy_failed
    if "!SETUP_CHOICE!"=="4" goto :remote_origin_confirmed
) else (
    echo No remote 'origin' configured yet for this repository.
    echo =========================================================================
    echo.
    echo Select target GitHub repository connection:
    echo.
    echo   [1] Connect to 'ahbiyout-all' (Recommended - GitHub Username)
    echo       URL: https://github.com/ahbiyout-all/photoshop-language-switcher.git
    echo.
    echo   [2] Connect to 'ahbiyout' (Account Name)
    echo       URL: https://github.com/ahbiyout/photoshop-language-switcher.git
    echo.
    echo   [3] Enter custom GitHub repository URL directly (Paste from browser)
    echo.
    echo   [4] Cancel deployment
    echo.
    set "SETUP_CHOICE=1"
    set /p SETUP_CHOICE="Select option [1-4, default 1]: "
    if "!SETUP_CHOICE!"=="4" goto :deploy_failed
)

set "TARGET_REMOTE_URL=https://github.com/ahbiyout-all/photoshop-language-switcher.git"
if "!SETUP_CHOICE!"=="2" set "TARGET_REMOTE_URL=https://github.com/ahbiyout/photoshop-language-switcher.git"
if "!SETUP_CHOICE!"=="3" (
    set "USER_URL="
    set /p USER_URL="Enter your GitHub repository clone URL: "
    if not "!USER_URL!"=="" set "TARGET_REMOTE_URL=!USER_URL!"
)

echo -- Configuring remote 'origin': !TARGET_REMOTE_URL!
git remote remove origin >nul 2>&1
git remote add origin "!TARGET_REMOTE_URL!"

:: Configure git user.name and privacy-protected noreply email
git config user.name >nul 2>&1
if !errorlevel! neq 0 git config user.name "AhBiYout"
for /f "tokens=*" %%E in ('git config user.email 2^>nul') do (
    echo %%E | findstr /i "@users.noreply.github.com" >nul 2>&1
    if !errorlevel! neq 0 git config user.email "ahbiyout-all@users.noreply.github.com"
)
git config user.email >nul 2>&1
if !errorlevel! neq 0 git config user.email "ahbiyout-all@users.noreply.github.com"

echo -- Staging files...
git add .
git commit -m "feat: release %APP_TAG% - Photoshop & Illustrator Language Switcher" >nul 2>&1

:remote_origin_confirmed
echo -- Git remote 'origin' confirmed:
for /f "tokens=*" %%R in ('git remote -v 2^>nul ^| findstr "(push)"') do echo    %%R
echo.

:: -------------------------------------------------------------------------
:: Step 3: Choose Deployment Strategy
:: -------------------------------------------------------------------------
echo [Step 3/5] Select Deployment Strategy:
echo.
echo   [1] GitHub Actions CI/CD (Recommended)
echo       - Pushes source to 'main' branch
echo       - .github/workflows/deploy.yml automatically compiles and publishes
echo       - Free SSL, automatic updates on every git push
echo.
echo   [2] Direct Build ^& Push to 'gh-pages' Branch
echo       - Compiles Vite SPA bundle locally on your machine
echo       - Generates .nojekyll and 404.html redirection
echo       - Directly pushes compiled 'dist' bundle to origin gh-pages
echo.
set "DEPLOY_CHOICE=1"
set /p DEPLOY_CHOICE="Select method [1 or 2, default 1]: "

if "%DEPLOY_CHOICE%"=="2" (
    goto :deploy_direct_gh_pages
)

:: -------------------------------------------------------------------------
:: Method 1: Deploy via GitHub Actions
:: -------------------------------------------------------------------------
:deploy_actions
echo.
echo [Step 4/5] Deploying via GitHub Actions CI/CD...
echo -- Staging latest files...
git add .
git commit -m "deploy: update %APP_TAG% for GitHub Pages" >nul 2>&1

echo -- Pushing to origin main...
git push -u origin main
if !errorlevel! equ 0 goto :actions_push_success

echo.
echo =========================================================================
echo [NOTICE] Push to remote 'main' was rejected by GitHub.
echo Reason: The remote repository contains commits not in your local branch.
echo This typically occurs when the GitHub repository was initialized with
echo a README/License, or commits were previously made to origin/main.
echo =========================================================================
echo.
echo Select conflict resolution strategy:
echo.
echo   [1] Auto-Rebase ^& Push (Recommended)
echo       - Pulls remote commits and reapplies your latest code on top
echo       - Command: git pull --rebase origin main ^&^& git push -u origin main
echo.
echo   [2] Force Push (Direct Release Sync)
echo       - Overwrites remote 'main' with your local latest code (%APP_TAG%)
echo       - Command: git push -f origin main --tags
echo.
echo   [3] Auto-Merge ^& Push
echo       - Creates a merge commit to reconcile branches
echo       - Command: git pull origin main --no-rebase ^&^& git push -u origin main
echo.
echo   [4] Cancel deployment
echo.
set "RESOLVE_CHOICE=1"
set /p RESOLVE_CHOICE="Select option [1-4, default 1]: "

if "!RESOLVE_CHOICE!"=="2" goto :action_force_push
if "!RESOLVE_CHOICE!"=="3" goto :action_merge_push
if "!RESOLVE_CHOICE!"=="4" goto :deploy_failed

:action_rebase_push
echo.
:: Ensure no stuck unmerged files exist from previous runs
git merge --abort >nul 2>&1
git rebase --abort >nul 2>&1
git reset --merge >nul 2>&1
echo -- Attempting automated git pull with rebase (git pull --rebase origin main)...
git pull --rebase origin main
if !errorlevel! equ 0 (
    echo -- Rebase successful. Pushing to origin main...
    git push -u origin main --tags
    if !errorlevel! equ 0 goto :actions_push_success
    goto :permission_403_resolver
)
echo.
echo [WARNING] Rebase encountered conflicts with remote files.
echo Would you like to abort the rebase and force push your latest files instead?
set "FALLBACK_FORCE=Y"
set /p FALLBACK_FORCE="Force update remote 'main' to %APP_TAG%? [Y/N, default Y]: "
if /i not "!FALLBACK_FORCE!"=="N" (
    git rebase --abort >nul 2>&1
    git merge --abort >nul 2>&1
    git reset --merge >nul 2>&1
    goto :action_force_push
) else (
    git rebase --abort >nul 2>&1
    git merge --abort >nul 2>&1
    git reset --merge >nul 2>&1
    goto :deploy_failed
)

:action_force_push
echo.
:: Clean any leftover merge/rebase conflict states
git merge --abort >nul 2>&1
git rebase --abort >nul 2>&1
git reset --merge >nul 2>&1
echo -- Force pushing latest code and release tags to remote 'main'...
git push -f origin main --tags
if !errorlevel! equ 0 goto :actions_push_success
goto :permission_403_resolver

:action_merge_push
echo.
:: Clean unmerged state before merge attempt
git merge --abort >nul 2>&1
git rebase --abort >nul 2>&1
git reset --merge >nul 2>&1
echo -- Attempting automated git pull with merge (git pull origin main --no-rebase)...
git pull origin main --no-rebase --no-edit
if !errorlevel! equ 0 (
    echo -- Merge successful. Pushing to origin main...
    git push -u origin main --tags
    if !errorlevel! equ 0 goto :actions_push_success
    goto :permission_403_resolver
)
echo.
echo [ERROR] Merge conflict occurred. Please resolve manually or select Force Push.
goto :permission_403_resolver

:permission_403_resolver
echo.
echo =========================================================================
echo [TROUBLESHOOTER] GitHub Permission / Authentication Error Detected (HTTP 403)
echo =========================================================================
echo Current Remote URL :
for /f "tokens=*" %%R in ('git remote get-url origin 2^>nul') do echo    %%R
for /f "tokens=*" %%U in ('git config user.name 2^>nul') do echo Git Author Name   : %%U
echo.
echo Root Cause:
echo   Your repository belongs to 'ahbiyout' (Display: 'ahbiyout-all').
echo   If Windows Credential Manager has cached outdated credentials or
echo   GitHub requires re-authentication, you can reset credentials or use a token.
echo =========================================================================
echo.
echo How would you like to resolve this?
echo.
echo   [1] Switch Remote to 'ahbiyout-all' (Recommended - GitHub Username)
echo       URL: https://github.com/ahbiyout-all/photoshop-language-switcher.git
echo.
echo   [2] Switch Remote to 'ahbiyout' (Account Name)
echo       URL: https://github.com/ahbiyout/photoshop-language-switcher.git
echo.
echo   [3] Reset Windows Credential ^& sign in to GitHub
echo       - Deletes cached credentials to trigger fresh browser login
echo.
echo   [4] Authenticate using GitHub Personal Access Token (PAT)
echo.
echo   [5] Enter your own custom GitHub repository URL
echo.
echo   [6] Open GitHub Repository Settings in browser
echo.
echo   [7] Retry push with existing credentials
echo.
echo   [8] Cancel deployment
echo.
set "AUTH_CHOICE=1"
set /p AUTH_CHOICE="Select resolution [1-8, default 1]: "

if "!AUTH_CHOICE!"=="1" (
    echo -- Switching remote origin to ahbiyout-all...
    git remote set-url origin https://github.com/ahbiyout-all/photoshop-language-switcher.git
    goto :action_force_push
)
if "!AUTH_CHOICE!"=="2" (
    echo -- Switching remote origin to ahbiyout...
    git remote set-url origin https://github.com/ahbiyout/photoshop-language-switcher.git
    goto :action_force_push
)
if "!AUTH_CHOICE!"=="3" (
    echo -- Clearing cached GitHub credentials from Windows Credential Manager...
    cmdkey /delete:git:https://github.com >nul 2>&1
    cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>&1
    echo -- Cached credentials cleared!
    echo -- A GitHub browser window will open for sign-in.
    echo.
    goto :action_force_push
)
if "!AUTH_CHOICE!"=="4" (
    echo.
    echo GitHub Personal Access Token (PAT) Setup:
    echo 1. Open https://github.com/settings/tokens in your browser
    echo 2. Click 'Generate new token (classic)' -^> Check 'repo' scope -^> Generate
    echo.
    set "GH_PAT="
    set /p GH_PAT="Paste your GitHub Personal Access Token (PAT): "
    if not "!GH_PAT!"=="" (
        for /f "tokens=*" %%R in ('git remote get-url origin 2^>nul') do set "CURR_URL=%%R"
        for /f "tokens=2* delims=@" %%A in ("!CURR_URL!") do (
            if not "%%A"=="" set "CURR_URL=https://%%A"
        )
        set "CLEAN_URL=!CURR_URL:https://=!"
        git remote set-url origin "https://!GH_PAT!@!CLEAN_URL!"
        echo -- Token configured in remote URL. Retrying push...
        goto :action_force_push
    )
    goto :deploy_failed
)
if "!AUTH_CHOICE!"=="5" (
    set "NEW_REMOTE_URL="
    set /p NEW_REMOTE_URL="Enter your GitHub repository clone URL: "
    if not "!NEW_REMOTE_URL!"=="" (
        git remote set-url origin "!NEW_REMOTE_URL!"
        goto :action_force_push
    )
    goto :deploy_failed
)
if "!AUTH_CHOICE!"=="6" (
    echo -- Opening repository settings in browser...
    start https://github.com/ahbiyout/photoshop-language-switcher/settings
    pause
    goto :action_force_push
)
if "!AUTH_CHOICE!"=="7" (
    goto :action_force_push
)
goto :deploy_failed

:actions_push_success

echo.
echo [Step 5/5] GitHub Pages Activation Guide:
echo -------------------------------------------------------------------------
echo 1. Open your repository on GitHub in your browser.
echo 2. Navigate to: Settings -^> Pages (left sidebar).
echo 3. Under 'Build and deployment' -^> 'Source', select:
echo    --^> [GitHub Actions]
echo 4. Click 'Save'.
echo 5. GitHub Actions will now automatically build and publish your site!
echo.
echo Your application will be live at:
echo https://^<YOUR_GITHUB_USERNAME^>.github.io/^<YOUR_REPOSITORY_NAME^>/
echo -------------------------------------------------------------------------
goto :deploy_success

:: -------------------------------------------------------------------------
:: Method 2: Direct Local Build & Push to gh-pages Branch
:: -------------------------------------------------------------------------
:deploy_direct_gh_pages
echo.
echo [Step 4/5] Compiling Vite SPA locally and preparing gh-pages branch...

if "!NODE_FOUND!"=="0" (
    echo.
    echo =========================================================================
    echo [NOTICE] Method 2 (Direct Local Build) requires Node.js and npm on this PC.
    echo =========================================================================
    echo.
    echo Options:
    echo   [1] Switch to Method 1: GitHub Actions CI/CD (Recommended)
    echo       - Builds in GitHub Cloud without needing Node.js on this PC!
    echo.
    echo   [2] Auto-install Node.js LTS via winget
    echo       - Command: winget install OpenJS.NodeJS.LTS -e
    echo.
    echo   [3] Cancel deployment
    echo.
    set "NODE_ACT=1"
    set /p NODE_ACT="Select option [1-3, default 1]: "
    if "!NODE_ACT!"=="1" goto :deploy_actions
    if "!NODE_ACT!"=="2" (
        echo -- Installing Node.js LTS via winget...
        winget install OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
        if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;!PATH!"
        where node >nul 2>&1
        if !errorlevel! equ 0 (
            set "NODE_FOUND=1"
        ) else (
            echo [NOTICE] Node.js installed. Please restart this script to reload PATH.
            pause
            exit /b 0
        )
    ) else (
        goto :deploy_failed
    )
)

if not exist "node_modules\" (
    echo -- Installing dependencies...
    call npm install
)

echo -- Running Vite production build (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Vite build failed!
    goto :deploy_failed
)

if not exist "dist\" (
    echo [ERROR] dist folder was not generated!
    goto :deploy_failed
)

:: Inject .nojekyll and 404.html if missing
echo. > dist\.nojekyll
if exist "public\404.html" (
    copy /y "public\404.html" "dist\404.html" >nul
)

echo -- Deploying dist folder to gh-pages branch...
set "TEMP_DEPLOY_DIR=%TEMP%\gh_pages_deploy_%RANDOM%"
mkdir "!TEMP_DEPLOY_DIR!" >nul 2>&1
xcopy /E /I /Y "dist\*" "!TEMP_DEPLOY_DIR!\" >nul

for /f "tokens=2 delims= " %%R in ('git remote -v ^| findstr "origin" ^| findstr "(push)"') do (
    set "REMOTE_REPO_URL=%%R"
)

pushd "!TEMP_DEPLOY_DIR!"
git init -b gh-pages
git add .
git commit -m "Deploy %APP_TAG% to GitHub Pages"
git remote add origin "!REMOTE_REPO_URL!"
echo -- Pushing build artifacts to remote branch 'gh-pages'...
git push -f origin gh-pages
set "PUSH_ERR=!errorlevel!"
popd

rmdir /s /q "!TEMP_DEPLOY_DIR!" >nul 2>&1

if !PUSH_ERR! neq 0 (
    echo [ERROR] Failed to push to gh-pages branch!
    goto :deploy_failed
)

echo.
echo [Step 5/5] GitHub Pages Branch Activation Guide:
echo -------------------------------------------------------------------------
echo 1. Open your repository on GitHub in your browser.
echo 2. Navigate to: Settings -^> Pages (left sidebar).
echo 3. Under 'Build and deployment' -^> 'Source', select:
echo    --^> 'Deploy from a branch'
echo 4. Under 'Branch', select 'gh-pages' and folder '/ (root)', then click 'Save'.
echo.
echo Your application will be live in 1-2 minutes at:
echo https://^<YOUR_GITHUB_USERNAME^>.github.io/^<YOUR_REPOSITORY_NAME^>/
echo -------------------------------------------------------------------------

:deploy_success
echo.
echo =========================================================================
echo   Deployment Process Completed Successfully!
echo =========================================================================
echo   - Version Deployed : %APP_TAG%
echo   - Static Routing   : .nojekyll + 404.html SPA Fallback Included
echo =========================================================================
echo.
pause
exit /b 0

:deploy_failed
echo.
echo [ERROR] Deployment failed or was cancelled. Please check the logs above.
echo.
pause
exit /b 1
