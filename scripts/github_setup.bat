@echo off
setlocal enabledelayedexpansion

:: =========================================================================
::  Adobe Photoshop & Illustrator Language Switcher
::  GitHub Repository Setup & Initial Commit Automation (Windows CRLF)
::
::  Developer: AhBiYout
::  Official Google Blog: https://ahbiyoutvibe.blogspot.com/
::  Organization: https://www.cisnet.co.kr (CIS)
::  Copyright (C) 2026 AhBiYout. All rights reserved.
:: =========================================================================

title Adobe Language Switcher - GitHub Repository Setup Assistant

echo =========================================================================
echo   Adobe Photoshop ^& Illustrator Language Switcher
echo   GitHub Repository Setup ^& Publication Assistant (Windows CRLF)
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
:: Step 1: Check Git Installation
:: -------------------------------------------------------------------------
echo [Step 1/5] Verifying Git installation...

:: Auto-scan standard Windows install directories for Git
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

if "!GIT_FOUND!"=="1" goto :git_setup_ready

echo.
echo =========================================================================
echo [PREREQUISITE NOTICE] Git is not installed or not found in system PATH.
echo Git is required to initialize repository and push to GitHub.
echo =========================================================================
echo.

where winget >nul 2>&1
if !errorlevel! neq 0 goto :manual_setup_git

echo Windows Package Manager [winget] detected on this computer!
echo You can automatically install Git now in one click:
echo   Command: winget install --id Git.Git -e --source winget
echo.
set "AUTO_GIT=Y"
set /p AUTO_GIT="Auto-install Git for Windows now? [Y/N, default Y]: "
if /i "!AUTO_GIT!"=="N" goto :manual_setup_git

echo.
echo -- Installing Git for Windows via winget (please allow any Windows UAC prompt)...
winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
if exist "C:\Program Files\Git\cmd" set "PATH=C:\Program Files\Git\cmd;!PATH!"
if exist "%LOCALAPPDATA%\Programs\Git\cmd" set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;!PATH!"
where git >nul 2>&1
if !errorlevel! equ 0 (
    echo [SUCCESS] Git installed and configured for this session!
    goto :git_setup_ready
)

echo.
echo [NOTICE] Git installation finished!
echo To finalize environment variables, please close and restart this script:
echo   github_setup.bat
echo.
pause
exit /b 0

:manual_setup_git
echo.
echo Manual Git Installation Guide:
echo 1. Download official installer from: https://git-scm.com/download/win
echo 2. Run the installer and keep standard options.
echo 3. Re-run this setup script once installed.
echo.
set "OPEN_GIT_URL=Y"
set /p OPEN_GIT_URL="Open Git download page in your browser? [Y/N, default Y]: "
if /i not "!OPEN_GIT_URL!"=="N" (
    start https://git-scm.com/download/win
)
goto :error_exit

:git_setup_ready
echo -- Git detected successfully:
for /f "tokens=*" %%G in ('git --version 2^>nul') do echo    %%G
echo.

:: -------------------------------------------------------------------------
:: Step 2: Read Application Version from package.json
:: -------------------------------------------------------------------------
echo [Step 2/5] Reading application version from package.json...
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
echo -- Current Release Version : %APP_VERSION% (%APP_TAG%)
echo.

:: -------------------------------------------------------------------------
:: Step 3: Initialize Git Repository & Check .gitignore
:: -------------------------------------------------------------------------
echo [Step 3/5] Checking Git repository status...
if not exist ".git\" (
    echo -- Initializing new Git repository with default branch 'main'...
    git init -b main >nul 2>&1
    if !errorlevel! neq 0 (
        git init
        git branch -M main
    )
    echo -- Git repository initialized.
) else (
    echo -- Existing Git repository detected.
    git branch -M main >nul 2>&1
)

if not exist ".gitignore" (
    echo [WARNING] .gitignore not found. Creating standard .gitignore...
    (
        echo node_modules/
        echo dist/
        echo build/
        echo release/
        echo *.log
        echo .env
        echo .env.local
        echo !.env.example
        echo .DS_Store
        echo Thumbs.db
    ) > .gitignore
)
echo -- .gitignore verified.
echo.

:: -------------------------------------------------------------------------
:: Step 4: Verify Git Author & Stage Files & Commit & Tag
:: -------------------------------------------------------------------------
echo [Step 4/5] Staging files for GitHub upload...
echo Allowed project files:
echo   - src/      : Full React TypeScript source code
echo   - docs/     : Architecture, Guides, and Patch Notes
echo   - public/   : Web assets, manifest, and .nojekyll
echo   - scripts/  : Build and deployment automation scripts
echo   - .github/  : GitHub Actions CI/CD workflows
echo.

:: Verify and auto-configure Git Author Identity if missing
set "GIT_AUTHOR_NAME="
set "GIT_AUTHOR_EMAIL="
for /f "tokens=*" %%A in ('git config user.name 2^>nul') do set "GIT_AUTHOR_NAME=%%A"
for /f "tokens=*" %%B in ('git config user.email 2^>nul') do set "GIT_AUTHOR_EMAIL=%%B"

if "!GIT_AUTHOR_NAME!"=="" (
    echo -- Git user.name not detected. Configuring local author name: AhBiYout
    git config user.name "AhBiYout"
    set "GIT_AUTHOR_NAME=AhBiYout"
) else (
    echo -- Git Author Name  : !GIT_AUTHOR_NAME!
)

if "!GIT_AUTHOR_EMAIL!"=="" (
    echo -- Git user.email not detected. Configuring privacy noreply email: ahbiyout-all@users.noreply.github.com
    git config user.email "ahbiyout-all@users.noreply.github.com"
    set "GIT_AUTHOR_EMAIL=ahbiyout-all@users.noreply.github.com"
) else (
    :: Sanitize personal email to privacy-protected GitHub noreply email
    echo !GIT_AUTHOR_EMAIL! | findstr /i "@users.noreply.github.com" >nul 2>&1
    if !errorlevel! neq 0 (
        echo -- Sanitizing personal email to privacy-protected GitHub noreply email...
        git config user.email "ahbiyout-all@users.noreply.github.com"
        set "GIT_AUTHOR_EMAIL=ahbiyout-all@users.noreply.github.com"
    )
    echo -- Git Author Email : !GIT_AUTHOR_EMAIL!
)

git add .
git status --short

echo.
set "DEFAULT_COMMIT_MSG=feat: release %APP_TAG% - Adobe Language Switcher Suite"
echo Default Commit Message: !DEFAULT_COMMIT_MSG!
set "COMMIT_MSG="
set /p COMMIT_MSG="Enter commit message [Press ENTER for default]: "
if "!COMMIT_MSG!"=="" (
    set "COMMIT_MSG=!DEFAULT_COMMIT_MSG!"
)

echo -- Creating commit...
git commit -m "!COMMIT_MSG!"
if %errorlevel% neq 0 (
    echo -- Working tree clean or commit already up to date.
)

:: Create git version tag if HEAD exists
git rev-parse HEAD >nul 2>&1
if %errorlevel% equ 0 (
    echo -- Creating Git version tag %APP_TAG%...
    git tag -d "%APP_TAG%" >nul 2>&1
    git tag -a "%APP_TAG%" -m "Release %APP_TAG% - Adobe Language Switcher Suite"
    if !errorlevel! equ 0 (
        echo -- Tag %APP_TAG% created successfully.
    ) else (
        echo [WARNING] Tag %APP_TAG% could not be created or already exists.
    )
) else (
    echo [WARNING] No commits detected yet. Version tag %APP_TAG% will be created on next commit.
)
echo.

:: -------------------------------------------------------------------------
:: Step 5: Configure Remote Repository & Push Guidance (Label-based jumps)
:: -------------------------------------------------------------------------
echo [Step 5/5] GitHub Remote Configuration:

git remote -v | findstr "origin" >nul 2>&1
if %errorlevel% equ 0 goto :remote_origin_found
goto :remote_origin_setup

:remote_origin_found
echo Existing remote origin found:
git remote -v
echo.
set "PUSH_NOW=Y"
set /p PUSH_NOW="Would you like to push to origin main now? [Y/N, default Y]: "
if /i "!PUSH_NOW!"=="N" (
    echo Push skipped. You can push manually with:
    echo   git push -u origin main --tags
    goto :success_exit
)
:: Ensure no stuck unmerged files exist
git merge --abort >nul 2>&1
git rebase --abort >nul 2>&1
git reset --merge >nul 2>&1
echo -- Pushing branch 'main' and tags to remote...
git push -u origin main --tags
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Code and release tag %APP_TAG% successfully pushed to GitHub!
    goto :success_exit
)

echo.
echo =========================================================================
echo [NOTICE] Push rejected by GitHub (Remote already contains previous commits).
echo Since this directory contains the latest code (%APP_TAG%), choose resolution:
echo =========================================================================
echo.
echo   [1] Auto-Rebase ^& Push (git pull --rebase origin main)
echo   [2] Force Push (git push -f origin main --tags)
echo   [3] Skip push
echo.
set "SETUP_RESOLVE=1"
set /p SETUP_RESOLVE="Select option [1-3, default 1]: "
if "!SETUP_RESOLVE!"=="1" (
    git merge --abort >nul 2>&1
    git rebase --abort >nul 2>&1
    git reset --merge >nul 2>&1
    echo -- Running git pull --rebase origin main...
    git pull --rebase origin main
    if !errorlevel! equ 0 (
        echo -- Rebase successful. Pushing to origin main...
        git push -u origin main --tags
        if !errorlevel! equ 0 (
            echo.
            echo [SUCCESS] Code and release tag %APP_TAG% successfully pushed to GitHub!
            goto :success_exit
        )
    )
    echo [WARNING] Rebase failed or had conflicts. Aborting rebase...
    git rebase --abort >nul 2>&1
    git merge --abort >nul 2>&1
    git reset --merge >nul 2>&1
    set "SETUP_RESOLVE=2"
)
if "!SETUP_RESOLVE!"=="2" (
    git merge --abort >nul 2>&1
    git rebase --abort >nul 2>&1
    git reset --merge >nul 2>&1
    echo -- Force updating remote branch 'main' and tags...
    git push -f origin main --tags
    if !errorlevel! equ 0 (
        echo.
        echo [SUCCESS] Remote main successfully force-updated to %APP_TAG%!
        goto :success_exit
    )
    goto :setup_permission_403_resolver
)
goto :setup_permission_403_resolver

:remote_origin_setup
echo Remote 'origin' is not yet configured.
echo.
echo Select target GitHub repository connection:
echo   [1] Connect to 'ahbiyout-all' (Recommended - GitHub Username)
echo       URL: https://github.com/ahbiyout-all/photoshop-language-switcher.git
echo   [2] Connect to 'ahbiyout' (Account Name)
echo       URL: https://github.com/ahbiyout/photoshop-language-switcher.git
echo   [3] Enter custom GitHub repository URL directly
echo.
set "REMOTE_SETUP_CHOICE=1"
set /p REMOTE_SETUP_CHOICE="Select option [1-3, default 1]: "

set "REPO_URL=https://github.com/ahbiyout-all/photoshop-language-switcher.git"
if "!REMOTE_SETUP_CHOICE!"=="2" set "REPO_URL=https://github.com/ahbiyout/photoshop-language-switcher.git"
if "!REMOTE_SETUP_CHOICE!"=="3" (
    set "CUSTOM_IN_URL="
    set /p CUSTOM_IN_URL="Enter your GitHub repository clone URL: "
    if not "!CUSTOM_IN_URL!"=="" set "REPO_URL=!CUSTOM_IN_URL!"
)

git remote add origin !REPO_URL!
echo -- Remote origin added: !REPO_URL!
echo.
set "PUSH_FIRST=Y"
set /p PUSH_FIRST="Would you like to push to GitHub now? [Y/N, default Y]: "
if /i "!PUSH_FIRST!"=="N" (
    echo Push skipped. You can push manually with:
    echo   git push -u origin main --tags
    goto :success_exit
)

:: Ensure no stuck unmerged files exist
git merge --abort >nul 2>&1
git rebase --abort >nul 2>&1
git reset --merge >nul 2>&1
echo -- Pushing branch 'main' and tags to remote...
git push -u origin main --tags
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Code and release tag %APP_TAG% successfully pushed to GitHub!
    goto :success_exit
)

echo.
echo =========================================================================
echo [NOTICE] Push rejected by GitHub (Remote already contains previous commits).
echo Since this directory contains the latest code [!APP_TAG!], choose resolution:
echo =========================================================================
echo.
echo   [1] Auto-Rebase ^& Push (git pull --rebase origin main)
echo   [2] Force Push (git push -f origin main --tags)
echo   [3] Skip push
echo.
set "SETUP_RESOLVE_FIRST=1"
set /p SETUP_RESOLVE_FIRST="Select option [1-3, default 1]: "
if "!SETUP_RESOLVE_FIRST!"=="1" (
    git merge --abort >nul 2>&1
    git rebase --abort >nul 2>&1
    git reset --merge >nul 2>&1
    echo -- Running git pull --rebase origin main...
    git pull --rebase origin main
    if !errorlevel! equ 0 (
        echo -- Rebase successful. Pushing to origin main...
        git push -u origin main --tags
        if !errorlevel! equ 0 (
            echo.
            echo [SUCCESS] Code and release tag %APP_TAG% successfully pushed to GitHub!
            goto :success_exit
        )
    )
    echo [WARNING] Rebase failed or had conflicts. Aborting rebase...
    git rebase --abort >nul 2>&1
    git merge --abort >nul 2>&1
    git reset --merge >nul 2>&1
    set "SETUP_RESOLVE_FIRST=2"
)
if "!SETUP_RESOLVE_FIRST!"=="2" (
    git merge --abort >nul 2>&1
    git rebase --abort >nul 2>&1
    git reset --merge >nul 2>&1
    echo -- Force updating remote branch 'main' and tags...
    git push -f origin main --tags
    if !errorlevel! equ 0 (
        echo.
        echo [SUCCESS] Remote main successfully force-updated to %APP_TAG%!
        goto :success_exit
    )
    goto :setup_permission_403_resolver
)
goto :setup_permission_403_resolver

:setup_permission_403_resolver
echo.
echo =========================================================================
echo [TROUBLESHOOTER] GitHub Permission / Authentication Error Detected (HTTP 403)
echo =========================================================================
echo Current Remote URL :
for /f "tokens=*" %%R in ('git remote get-url origin 2^>nul') do echo    %%R
echo Git Author Name    : !GIT_AUTHOR_NAME!
echo.
echo Root Cause:
echo   Your repository belongs to 'ahbiyout' (Display: 'ahbiyout-all').
echo   If Windows Credential Manager has cached outdated credentials or
echo   GitHub requires re-authentication, you can reset credentials or use a token.
echo =========================================================================
echo.
echo How would you like to resolve this?
echo.
echo   [1] Reset Windows Credential ^& sign in to GitHub as 'ahbiyout-all' (Recommended)
echo       - Deletes cached GitHub credentials
echo       - Next push will open GitHub browser login: sign in as 'ahbiyout-all'
echo.
echo   [2] Authenticate using GitHub Personal Access Token (PAT)
echo       - Generate a token in 'ahbiyout-all' account and paste it here
echo.
echo   [3] Open GitHub Repository Collaborators Settings in browser
echo       - Manage permissions at https://github.com/ahbiyout-all/photoshop-language-switcher
echo.
echo   [4] Enter your own custom GitHub repository URL
echo.
echo   [5] Retry push with existing credentials
echo.
echo   [6] Skip push
echo.
set "SETUP_AUTH_CHOICE=1"
set /p SETUP_AUTH_CHOICE="Select resolution [1-6, default 1]: "

if "!SETUP_AUTH_CHOICE!"=="1" (
    echo -- Clearing cached GitHub credentials from Windows Credential Manager...
    cmdkey /delete:git:https://github.com >nul 2>&1
    cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>&1
    echo -- Cached credentials cleared!
    echo -- A GitHub browser window will open. Please sign in as 'ahbiyout-all'.
    echo.
    git push -f origin main --tags
    if !errorlevel! equ 0 goto :success_exit
    goto :setup_permission_403_resolver
)
if "!SETUP_AUTH_CHOICE!"=="2" (
    echo.
    echo Generate a Personal Access Token with 'repo' scope at:
    echo https://github.com/settings/tokens (logged in as ahbiyout-all)
    echo.
    set "PAT_VAL="
    set /p PAT_VAL="Paste your GitHub Personal Access Token (PAT): "
    if not "!PAT_VAL!"=="" (
        for /f "tokens=*" %%R in ('git remote get-url origin 2^>nul') do set "CURR_URL=%%R"
        for /f "tokens=2* delims=@" %%A in ("!CURR_URL!") do (
            if not "%%A"=="" set "CURR_URL=https://%%A"
        )
        set "CLEAN_URL=!CURR_URL:https://=!"
        git remote set-url origin "https://!PAT_VAL!@!CLEAN_URL!"
        echo -- Token configured in remote URL. Retrying push...
        git push -f origin main --tags
        if !errorlevel! equ 0 goto :success_exit
        goto :setup_permission_403_resolver
    )
    goto :success_exit
)
if "!SETUP_AUTH_CHOICE!"=="3" (
    echo -- Opening repository collaborator settings in browser...
    start https://github.com/ahbiyout-all/photoshop-language-switcher/settings/access
    pause
    git push -f origin main --tags
    if !errorlevel! equ 0 goto :success_exit
    goto :setup_permission_403_resolver
)
if "!SETUP_AUTH_CHOICE!"=="4" (
    set "CUSTOM_URL="
    set /p CUSTOM_URL="Enter your GitHub repository clone URL: "
    if not "!CUSTOM_URL!"=="" (
        git remote set-url origin "!CUSTOM_URL!"
        git push -f origin main --tags
        if !errorlevel! equ 0 goto :success_exit
        goto :setup_permission_403_resolver
    )
    goto :success_exit
)
if "!SETUP_AUTH_CHOICE!"=="5" (
    git push -f origin main --tags
    if !errorlevel! equ 0 goto :success_exit
    goto :setup_permission_403_resolver
)
goto :success_exit

:manual_instructions
echo.
echo Run the following commands manually whenever you are ready:
echo   git remote add origin https://github.com/ahbiyout-all/photoshop-language-switcher.git
echo   git push -u origin main --tags
goto :success_exit

:success_exit
echo.
echo =========================================================================
echo   GitHub Preparation Completed!
echo =========================================================================
echo   - Repository Structure : Configured and verified
echo   - Git Author Identity  : !GIT_AUTHOR_NAME! ^<!GIT_AUTHOR_EMAIL!^>
echo   - Semantic Version Tag : %APP_TAG%
echo   - Next Step (Pages)    : Run 'deploy_gh_pages.bat' to publish to web
echo =========================================================================
echo.
pause
exit /b 0

:error_exit
echo.
echo [ERROR] Setup encountered an issue. Please review the messages above.
echo.
pause
exit /b 1
