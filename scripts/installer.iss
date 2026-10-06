; =========================================================================
;  Adobe Photoshop & Illustrator Language Switcher Suite
;  Inno Setup 6 Packaging Script (Windows CRLF)
;
;  Developer: AhBiYout
;  Organization: https://www.cisnet.co.kr (CIS)
;  Official Blog: https://ahbiyoutvibe.blogspot.com/
;  GitHub: https://github.com/ahbiyout/photoshop-language-switcher
;  Copyright (C) 2026 AhBiYout. All rights reserved.
; =========================================================================

#define MyAppName "Adobe Language Switcher Suite"
#define MyAppVersion "2.9.0"
#define MyAppPublisher "cisnet.co.kr | AhBiYout"
#define MyAppURL "https://www.cisnet.co.kr"
#define MyAppExeName "Adobe_Language_Switcher_Suite_v2.9.0.exe"
#define MyAppId "{{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}"

[Setup]
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL=https://github.com/ahbiyout/photoshop-language-switcher/releases
DefaultDirName={autopf}\AdobeLanguageSwitcher
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
LicenseFile=..\docs\LICENSE_EN.md
OutputDir=..\release
OutputBaseFilename=Adobe_Language_Switcher_Setup_v{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName} v{#MyAppVersion}
VersionInfoVersion=2.9.0.0
VersionInfoCompany=cisnet.co.kr
VersionInfoDescription=Adobe Photoshop & Illustrator Language Switcher Suite Installer
VersionInfoCopyright=Copyright (C) 2026 AhBiYout. All rights reserved.
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion=2.9.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\build\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\build\Photoshop_Language_Switcher_v{#MyAppVersion}.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\build\Photoshop_Language_Switcher_v{#MyAppVersion}.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\docs\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\LICENSE"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Photoshop Language Switcher"; Filename: "{app}\Photoshop_Language_Switcher_v{#MyAppVersion}.exe"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; Optional launch after GUI install
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// =========================================================================
// Pascal Script: Version Detection, Overwrite Protection, & Firewall Rules
// =========================================================================

// Check if an existing version is installed in Windows Registry
function GetExistingVersion(): String;
var
  InstalledVer: String;
begin
  Result := '';
  if RegQueryStringValue(HKLM, 'Software\Microsoft\Windows\CurrentVersion\Uninstall\' + ExpandConstant('{#MyAppId}') + '_is1', 'DisplayVersion', InstalledVer) then
  begin
    Result := InstalledVer;
  end;
end;

// InitializeSetup: Detect previous version and confirm overwrite or upgrade
function InitializeSetup(): Boolean;
var
  PrevVersion: String;
  PromptMsg: String;
begin
  Result := True;
  PrevVersion := GetExistingVersion();

  if PrevVersion <> '' then
  begin
    // If running in silent mode (/VERYSILENT or /SILENT), automatically proceed with upgrade
    if WizardSilent() then
    begin
      Log('Silent installation detected. Upgrading previous version ' + PrevVersion + ' to ' + ExpandConstant('{#MyAppVersion}'));
      Result := True;
    end
    else
    begin
      PromptMsg := 'A previous version (' + PrevVersion + ') of ' + ExpandConstant('{#MyAppName}') + ' is already installed on this computer.' + #13#10 + #13#10 +
                   'Do you want to overwrite and upgrade to version ' + ExpandConstant('{#MyAppVersion}') + '?' + #13#10 + #13#10 +
                   'Click [Yes] to proceed with upgrade, or [No] to cancel setup.';
      if MsgBox(PromptMsg, mbConfirmation, MB_YESNO) = IDYES then
      begin
        Result := True;
      end
      else
      begin
        Result := False;
      end;
    end;
  end;
end;

// Register Windows Firewall Inbound Rules for local communication
procedure RegisterFirewallRules();
var
  ResultCode: Integer;
  AppExePath: String;
  CmdAddRule: String;
begin
  AppExePath := ExpandConstant('{app}\{#MyAppExeName}');
  CmdAddRule := 'advfirewall firewall add rule name="' + ExpandConstant('{#MyAppName}') + '" dir=in action=allow program="' + AppExePath + '" enable=yes profile=any';
  
  Log('Registering firewall rule: ' + CmdAddRule);
  Exec('netsh.exe', CmdAddRule, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  if ResultCode = 0 then
    Log('Firewall inbound rule registered successfully.')
  else
    Log('Notice: Firewall rule registration returned code ' + IntToStr(ResultCode));
end;

// Remove Windows Firewall Inbound Rules during uninstall
procedure UnregisterFirewallRules();
var
  ResultCode: Integer;
  CmdDelRule: String;
begin
  CmdDelRule := 'advfirewall firewall delete rule name="' + ExpandConstant('{#MyAppName}') + '"';
  Log('Removing firewall rule: ' + CmdDelRule);
  Exec('netsh.exe', CmdDelRule, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

// Step notifications
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Automatically register firewall inbound rule post-installation
    RegisterFirewallRules();
  end;
end;

// Uninstall cleanup
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    // Automatically remove firewall inbound rule post-uninstallation
    UnregisterFirewallRules();
  end;
end;
