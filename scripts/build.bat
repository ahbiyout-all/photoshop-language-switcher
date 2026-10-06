@echo off
setlocal enabledelayedexpansion

:: =========================================================================
::  Adobe Photoshop & Illustrator Language Switcher
::  Automated Release Build Script (Windows CRLF)
::
::  Developer: AhBiYout
::  Official Google Blog: https://ahbiyoutvibe.blogspot.com/
::  Organization: https://www.cisnet.co.kr (CIS)
::  Copyright (C) 2026 AhBiYout. All rights reserved.
:: =========================================================================

title Adobe Language Switcher - Automated Release Build Pipeline

echo =========================================================================
echo   Adobe Photoshop ^& Illustrator Language Switcher
echo   Automated Release Build Pipeline (Windows CRLF)
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
:: Step 1: Verify Environment Prerequisites
:: -------------------------------------------------------------------------
echo [Step 1/5] Checking build environment prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js (v18 or higher) from https://nodejs.org/ and retry.
    goto :build_failed
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found in PATH!
    goto :build_failed
)
echo -- Node.js and npm detected successfully.

:: -------------------------------------------------------------------------
:: Step 2: Extract Application Version from package.json
:: -------------------------------------------------------------------------
echo.
echo [Step 2/5] Reading application version from package.json...
set "APP_VERSION="

:: Attempt PowerShell JSON parsing
for /f "tokens=*" %%V in ('powershell -NoProfile -Command "(Get-Content package.json -Raw | ConvertFrom-Json).version" 2^>nul') do (
    set "APP_VERSION=%%V"
)

:: Fallback to node evaluation if PowerShell output is empty
if "%APP_VERSION%"=="" (
    for /f "tokens=*" %%V in ('node -p "require('./package.json').version" 2^>nul') do (
        set "APP_VERSION=%%V"
    )
)

:: Safe fallback to 2.12.2 if detection fails
if "%APP_VERSION%"=="" (
    set "APP_VERSION=2.12.2"
    echo [WARNING] Could not parse package.json automatically. Using fallback version: %APP_VERSION%
)

set "APP_VERSION_TAG=v%APP_VERSION%"
echo -- Current Release Version : %APP_VERSION% (%APP_VERSION_TAG%)

:: -------------------------------------------------------------------------
:: Step 3: Compile Web SPA Frontend via Vite
:: -------------------------------------------------------------------------
echo.
echo [Step 3/5] Compiling Web SPA Frontend via Vite (npm run build)...
if not exist "node_modules\" (
    echo -- node_modules directory missing. Running npm install first...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install npm dependencies!
        goto :build_failed
    )
)

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend Vite build failed!
    goto :build_failed
)
echo -- Web SPA assets compiled successfully into .\dist\

:: -------------------------------------------------------------------------
:: Step 4: Locate Microsoft .NET Framework C# Compiler (csc.exe)
:: -------------------------------------------------------------------------
echo.
echo [Step 4/5] Locating Microsoft .NET Framework C# Compiler (csc.exe)...
set "CSC_EXE="
if exist "%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
    set "CSC_EXE=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
) else if exist "%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe" (
    set "CSC_EXE=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
) else if exist "%WINDIR%\Microsoft.NET\Framework64\v3.5\csc.exe" (
    set "CSC_EXE=%WINDIR%\Microsoft.NET\Framework64\v3.5\csc.exe"
) else if exist "%WINDIR%\Microsoft.NET\Framework\v3.5\csc.exe" (
    set "CSC_EXE=%WINDIR%\Microsoft.NET\Framework\v3.5\csc.exe"
) else (
    for /f "tokens=*" %%C in ('where csc.exe 2^>nul') do (
        if exist "%%C" set "CSC_EXE=%%C"
    )
)

if "%CSC_EXE%"=="" (
    echo [ERROR] Microsoft .NET C# Compiler (csc.exe) not found!
    echo Please ensure Microsoft .NET Framework 4.5+ is installed.
    goto :build_failed
)
echo -- Using C# Compiler: %CSC_EXE%

:: -------------------------------------------------------------------------
:: Step 5: Create Build Directories & Compile Executables with Version Suffix
:: -------------------------------------------------------------------------
echo.
echo [Step 5/5] Compiling native Windows executables with version suffix...
set "BUILD_DIR=build"
set "RELEASE_DIR=release"
if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%"

set "EXE_NAME=Photoshop_Language_Switcher_%APP_VERSION_TAG%.exe"
set "SUITE_EXE_NAME=Adobe_Language_Switcher_Suite_%APP_VERSION_TAG%.exe"
set "BAT_NAME=Photoshop_Language_Switcher_%APP_VERSION_TAG%.bat"

set "BUILD_EXE=%BUILD_DIR%\%EXE_NAME%"
set "BUILD_SUITE_EXE=%BUILD_DIR%\%SUITE_EXE_NAME%"
set "BUILD_BAT=%BUILD_DIR%\%BAT_NAME%"

set "RELEASE_EXE=%RELEASE_DIR%\%EXE_NAME%"
set "RELEASE_SUITE_EXE=%RELEASE_DIR%\%SUITE_EXE_NAME%"
set "RELEASE_BAT=%RELEASE_DIR%\%BAT_NAME%"

set "TEMP_CS=%TEMP%\Adobe_Switcher_Build_%RANDOM%.cs"

:: Generate Temporary C# Source with Full PE Properties & Self-Elevation
(
echo using System;
echo using System.IO;
echo using System.Diagnostics;
echo using System.Reflection;
echo using System.Security.Principal;
echo using System.Windows.Forms;
echo.
echo [assembly: AssemblyTitle("Adobe Photoshop ^& Illustrator Language Switcher")]
echo [assembly: AssemblyDescription("Adobe Photoshop, Illustrator and Extended Apps Multi-Language Switcher Desktop Utility")]
echo [assembly: AssemblyCompany("cisnet.co.kr")]
echo [assembly: AssemblyProduct("Adobe Language Switcher Suite")]
echo [assembly: AssemblyCopyright("Copyright (C) 2026 AhBiYout. All rights reserved.")]
echo [assembly: AssemblyTrademark("Official Core Engine: cisnet.co.kr | AhBiYout | Blog: https://ahbiyoutvibe.blogspot.com/")]
echo [assembly: AssemblyConfiguration("Official Distribution Engine by cisnet.co.kr | Verified Release %APP_VERSION_TAG%")]
echo [assembly: AssemblyVersion("%APP_VERSION%.0")]
echo [assembly: AssemblyFileVersion("%APP_VERSION%.0")]
echo [assembly: AssemblyInformationalVersion("%APP_VERSION%")]
echo.
echo namespace AdobeLanguageSwitcher
echo {
echo     class Program
echo     {
echo         [STAThread]
echo         static void Main(string[] args)
echo         {
echo             try
echo             {
echo                 WindowsIdentity identity = WindowsIdentity.GetCurrent();
echo                 WindowsPrincipal principal = new WindowsPrincipal(identity);
echo                 bool isAdmin = principal.IsInRole(WindowsBuiltInRole.Administrator);
echo.
echo                 if (!isAdmin)
echo                 {
echo                     ProcessStartInfo selfProc = new ProcessStartInfo();
echo                     selfProc.UseShellExecute = true;
echo                     selfProc.WorkingDirectory = Environment.CurrentDirectory;
echo                     selfProc.FileName = Application.ExecutablePath;
echo                     selfProc.Verb = "runas";
echo                     try {
echo                         Process.Start(selfProc);
echo                         return;
echo                     } catch {
echo                         MessageBox.Show("Administrator privileges are required to modify Adobe program files.\nPlease right-click and select 'Run as administrator'.", "Administrator Rights Required - cisnet.co.kr", MessageBoxButtons.OK, MessageBoxIcon.Warning);
echo                         return;
echo                     }
echo                 }
echo.
echo                 Console.Title = "Adobe Language Switcher %APP_VERSION_TAG% - cisnet.co.kr";
echo                 Console.ForegroundColor = ConsoleColor.Cyan;
echo                 Console.WriteLine("=========================================================================");
echo                 Console.WriteLine("  Adobe Photoshop ^& Illustrator Language Switcher (%APP_VERSION_TAG%)");
echo                 Console.WriteLine("  Developer : AhBiYout");
echo                 Console.WriteLine("  Blog      : https://ahbiyoutvibe.blogspot.com/");
echo                 Console.WriteLine("  Org       : https://www.cisnet.co.kr");
echo                 Console.WriteLine("=========================================================================");
echo                 Console.ResetColor();
echo                 Console.WriteLine();
echo                 Console.WriteLine("[1/3] Scanning installed Adobe applications (Photoshop, Illustrator)...");
echo.
echo                 string programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
echo                 string adobeDir = Path.Combine(programFiles, "Adobe");
echo                 int foundCount = 0;
echo.
echo                 if (Directory.Exists(adobeDir))
echo                 {
echo                     foreach (string dir in Directory.GetDirectories(adobeDir))
echo                     {
echo                         string dirName = Path.GetFileName(dir);
echo                         if (dirName.IndexOf("Photoshop", StringComparison.OrdinalIgnoreCase) >= 0 ^|^|
echo                             dirName.IndexOf("Illustrator", StringComparison.OrdinalIgnoreCase) >= 0)
echo                         {
echo                             Console.ForegroundColor = ConsoleColor.Green;
echo                             Console.WriteLine("  [Found] " + dirName);
echo                             Console.ResetColor();
echo                             foundCount++;
echo                         }
echo                     }
echo                 }
echo.
echo                 if (foundCount == 0)
echo                 {
echo                     Console.ForegroundColor = ConsoleColor.Yellow;
echo                     Console.WriteLine("  [Notice] Standard Adobe directory: " + adobeDir);
echo                     Console.ResetColor();
echo                 }
echo.
echo                 Console.WriteLine();
echo                 Console.WriteLine("-------------------------------------------------------------------------");
echo                 Console.WriteLine("  Select Operation Mode:");
echo                 Console.WriteLine("    [1] Smart Toggle (Switch between Korean/Target Locale and English)");
echo                 Console.WriteLine("    [2] Force English Mode (en_US)");
echo                 Console.WriteLine("    [3] Force Korean Mode (ko_KR)");
echo                 Console.WriteLine("    [4] Launch Web GUI Application (Default Browser)");
echo                 Console.WriteLine("    [5] Open Official Blog (https://ahbiyoutvibe.blogspot.com/)");
echo                 Console.WriteLine("    [Q] Quit");
echo                 Console.WriteLine("-------------------------------------------------------------------------");
echo                 Console.Write("  Enter choice (1-5, Q): ");
echo.
echo                 string choice = Console.ReadLine();
echo                 if (string.IsNullOrEmpty(choice)) choice = "1";
echo                 choice = choice.Trim();
echo.
echo                 if (choice.Equals("4", StringComparison.OrdinalIgnoreCase))
echo                 {
echo                     string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist", "index.html");
echo                     if (File.Exists(htmlPath))
echo                     {
echo                         Process.Start(new ProcessStartInfo("file:///" + htmlPath.Replace("\\", "/")) { UseShellExecute = true });
echo                     }
echo                     else
echo                     {
echo                         Process.Start(new ProcessStartInfo("https://www.cisnet.co.kr") { UseShellExecute = true });
echo                     }
echo                     return;
echo                 }
echo.
echo                 if (choice.Equals("5", StringComparison.OrdinalIgnoreCase))
echo                 {
echo                     Process.Start(new ProcessStartInfo("https://ahbiyoutvibe.blogspot.com/") { UseShellExecute = true });
echo                     return;
echo                 }
echo.
echo                 if (choice.Equals("Q", StringComparison.OrdinalIgnoreCase))
echo                 {
echo                     return;
echo                 }
echo.
echo                 // Execute Language Switcher Routine
echo                 ExecuteSwitcher(adobeDir, choice);
echo.
echo                 Console.ForegroundColor = ConsoleColor.Cyan;
echo                 Console.WriteLine();
echo                 Console.WriteLine("=========================================================================");
echo                 Console.WriteLine("  Operation completed successfully! Version: %APP_VERSION_TAG%");
echo                 Console.WriteLine("  Official Blog: https://ahbiyoutvibe.blogspot.com/");
echo                 Console.WriteLine("=========================================================================");
echo                 Console.ResetColor();
echo                 Console.WriteLine("Press any key to exit...");
echo                 Console.ReadKey();
echo             }
echo             catch (Exception ex)
echo             {
echo                 Console.ForegroundColor = ConsoleColor.Red;
echo                 Console.WriteLine("[Error] " + ex.Message);
echo                 Console.ResetColor();
echo                 Console.WriteLine("Press any key to close...");
echo                 Console.ReadKey();
echo             }
echo         }
echo.
echo         static void ExecuteSwitcher(string adobeDir, string mode)
echo         {
echo             Console.ForegroundColor = ConsoleColor.Yellow;
echo             Console.WriteLine("[2/3] Processing language configuration files...");
echo             Console.ResetColor();
echo.
echo             if (!Directory.Exists(adobeDir)) return;
echo.
echo             // Photoshop Processing
echo             foreach (string dir in Directory.GetDirectories(adobeDir))
echo             {
echo                 if (dir.IndexOf("Photoshop", StringComparison.OrdinalIgnoreCase) >= 0)
echo                 {
echo                     string localesDir = Path.Combine(dir, "Locales");
echo                     if (Directory.Exists(localesDir))
echo                     {
echo                         foreach (string loc in Directory.GetDirectories(localesDir))
echo                         {
echo                             string supFiles = Path.Combine(loc, "Support Files");
echo                             if (Directory.Exists(supFiles))
echo                             {
echo                                 string[] datFiles = Directory.GetFiles(supFiles, "tw10428*.dat*");
echo                                 foreach (string file in datFiles)
echo                                 {
echo                                     string ext = Path.GetExtension(file).ToLower();
echo                                     if (mode == "1")
echo                                     {
echo                                         if (ext == ".dat") {
echo                                             string target = file + ".bak";
echo                                             if (File.Exists(target)) File.Delete(target);
echo                                             File.Move(file, target);
echo                                             Console.WriteLine("  [Photoshop] Korean/Target -> English (" + Path.GetFileName(file) + ")");
echo                                         } else if (ext == ".bak") {
echo                                             string target = file.Substring(0, file.Length - 4);
echo                                             if (File.Exists(target)) File.Delete(target);
echo                                             File.Move(file, target);
echo                                             Console.WriteLine("  [Photoshop] English -> Korean/Target (" + Path.GetFileName(target) + ")");
echo                                         }
echo                                     }
echo                                     else if (mode == "2" ^&^& ext == ".dat")
echo                                     {
echo                                         string target = file + ".bak";
echo                                         if (File.Exists(target)) File.Delete(target);
echo                                         File.Move(file, target);
echo                                         Console.WriteLine("  [Photoshop] Forced English (tw10428 -> .bak)");
echo                                     }
echo                                     else if (mode == "3" ^&^& ext == ".bak")
echo                                     {
echo                                         string target = file.Substring(0, file.Length - 4);
echo                                         if (File.Exists(target)) File.Delete(target);
echo                                         File.Move(file, target);
echo                                         Console.WriteLine("  [Photoshop] Forced Korean (.bak -> tw10428)");
echo                                     }
echo                                 }
echo                             }
echo                         }
echo                     }
echo                 }
echo.
echo                 // Illustrator Processing
echo                 if (dir.IndexOf("Illustrator", StringComparison.OrdinalIgnoreCase) >= 0)
echo                 {
echo                     string xmlPath = Path.Combine(dir, "Support Files", "Contents", "Windows", "AMT", "application.xml");
echo                     if (File.Exists(xmlPath))
echo                     {
echo                         string content = File.ReadAllText(xmlPath);
echo                         if (mode == "1")
echo                         {
echo                             if (content.IndexOf("ko_KR", StringComparison.OrdinalIgnoreCase) >= 0) {
echo                                 content = content.Replace("ko_KR", "en_US");
echo                                 Console.WriteLine("  [Illustrator] Toggled: ko_KR -> en_US");
echo                             } else if (content.IndexOf("en_US", StringComparison.OrdinalIgnoreCase) >= 0) {
echo                                 content = content.Replace("en_US", "ko_KR");
echo                                 Console.WriteLine("  [Illustrator] Toggled: en_US -> ko_KR");
echo                             }
echo                         }
echo                         else if (mode == "2") {
echo                             content = content.Replace("ko_KR", "en_US");
echo                             Console.WriteLine("  [Illustrator] Set to en_US");
echo                         }
echo                         else if (mode == "3") {
echo                             content = content.Replace("en_US", "ko_KR");
echo                             Console.WriteLine("  [Illustrator] Set to ko_KR");
echo                         }
echo                         File.WriteAllText(xmlPath, content);
echo                     }
echo                 }
echo             }
echo         }
echo     }
echo }
) > "%TEMP_CS%"

:: Compile the C# file using csc.exe
"%CSC_EXE%" /nologo /target:exe /platform:anycpu /optimize+ /out:"%BUILD_EXE%" "%TEMP_CS%"
set "COMPILE_STATUS=%errorlevel%"

if exist "%TEMP_CS%" del /f /q "%TEMP_CS%" >nul 2>&1

if %COMPILE_STATUS% neq 0 (
    echo [ERROR] C# compilation failed with error code %COMPILE_STATUS%!
    goto :build_failed
)

echo -- Successfully compiled: %BUILD_EXE%

:: Copy to Suite executable name and release directory
copy /y "%BUILD_EXE%" "%BUILD_SUITE_EXE%" >nul 2>&1
copy /y "%BUILD_EXE%" "%RELEASE_EXE%" >nul 2>&1
copy /y "%BUILD_EXE%" "%RELEASE_SUITE_EXE%" >nul 2>&1
echo -- Successfully created: %BUILD_SUITE_EXE%

:: Generate companion standalone batch launcher
(
echo @echo off
echo :: Adobe Photoshop ^& Illustrator Language Switcher Launcher
echo :: Version: %APP_VERSION_TAG%
echo :: Developer: AhBiYout ^| Blog: https://ahbiyoutvibe.blogspot.com/ ^| Org: https://www.cisnet.co.kr
echo title Adobe Language Switcher %APP_VERSION_TAG%
echo start "" "%EXE_NAME%"
) > "%BUILD_BAT%"

copy /y "%BUILD_BAT%" "%RELEASE_BAT%" >nul 2>&1

echo.
echo =========================================================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo =========================================================================
echo   Release Version  : %APP_VERSION% (%APP_VERSION_TAG%)
echo   Build Directory  : .\%BUILD_DIR%\
echo   Release Directory: .\%RELEASE_DIR%\
echo.
echo   Generated Artifacts (with matching patch version suffix):
echo     1. %BUILD_DIR%\%EXE_NAME%
echo     2. %BUILD_DIR%\%SUITE_EXE_NAME%
echo     3. %BUILD_DIR%\%BAT_NAME%
echo     4. dist\ (Web SPA Distribution)
echo.
echo   Official Channels:
echo     - Developer: AhBiYout
echo     - Blog: https://ahbiyoutvibe.blogspot.com/
echo     - Organization: https://www.cisnet.co.kr
echo =========================================================================
echo.
if "%~1"=="/silent" exit /b 0
if "%CI%"=="true" exit /b 0
pause
exit /b 0

:build_failed
echo.
echo =========================================================================
echo   [BUILD FAILED] An error occurred during the build process.
echo   Please review the error output above.
echo =========================================================================
echo.
if "%~1"=="/silent" exit /b 1
if "%CI%"=="true" exit /b 1
pause
exit /b 1
