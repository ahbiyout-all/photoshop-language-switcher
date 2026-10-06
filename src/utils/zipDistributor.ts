import JSZip from 'jszip';
import {
  generateSmartToggleBat,
  generateToEnglishBat,
  generateToKoreanBat,
  generateDesktopShortcutBat,
  generateExeBuilderBat,
  generateAutoDetectMultiVersionBat,
  generateWindowsHtaApp,
  generatePowerShellWpfApp,
  generateReadmeReleaseText,
  downloadTextFile,
} from './photoshopHelper';
import { OFFICIAL_DEVELOPER_INFO } from '../types/developer';

/**
 * Creates and downloads a complete distributable release bundle (.ZIP)
 * Contains the standalone HTML Application (.hta) GUI, PowerShell WPF GUI (.ps1),
 * Native .bat scripts, Desktop Shortcut installer, Multi-version Auto-Scanner, and a detailed README.
 */
export async function downloadReleaseDistributionZip(
  folderPath: string,
  fileName: string,
  versionTag: string = 'v1.4.1'
): Promise<void> {
  const zip = new JSZip();

  const yearMatch = folderPath.match(/\b(20\d\d)\b/);
  const year = yearMatch ? yearMatch[1] : '2026';

  const htaContent = generateWindowsHtaApp(folderPath, fileName);
  const wpfContent = generatePowerShellWpfApp(folderPath, fileName);
  const toggleBat = generateSmartToggleBat(folderPath, fileName);
  const autoDetectBat = generateAutoDetectMultiVersionBat();
  const toEngBat = generateToEnglishBat(folderPath, fileName);
  const toKorBat = generateToKoreanBat(folderPath, fileName);
  const shortcutBat = generateDesktopShortcutBat(folderPath, fileName);
  const exeBuilderBat = generateExeBuilderBat(folderPath, fileName);
  const readmeText = generateReadmeReleaseText(folderPath, fileName, versionTag);

  // Helper to ensure Windows CRLF and UTF-8 with BOM
  const encodeWindowsText = (text: string, withBom: boolean = true): Uint8Array => {
    const crlfText = text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    const encoder = new TextEncoder();
    const encoded = encoder.encode(crlfText);

    if (withBom) {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const combined = new Uint8Array(bom.length + encoded.length);
      combined.set(bom, 0);
      combined.set(encoded, bom.length);
      return combined;
    }
    return encoded;
  };

  // 1. Root-level Main GUI Application (with multi-version auto-detection)
  zip.file(`Photoshop_${year}_Language_Switcher_GUI.hta`, encodeWindowsText(htaContent, true));

  // 2. PowerShell Modern GUI Application
  zip.file(`Photoshop_${year}_Switcher_WPF_GUI.ps1`, encodeWindowsText(wpfContent, true));

  // 3. Quick Run Batch Scripts
  const scriptsFolder = zip.folder('scripts');
  if (scriptsFolder) {
    scriptsFolder.file('photoshop_multi_version_auto_scanner.bat', encodeWindowsText(autoDetectBat, true));
    scriptsFolder.file(`photoshop_${year}_toggle_language.bat`, encodeWindowsText(toggleBat, true));
    scriptsFolder.file(`photoshop_${year}_switch_to_english.bat`, encodeWindowsText(toEngBat, true));
    scriptsFolder.file(`photoshop_${year}_switch_to_korean.bat`, encodeWindowsText(toKorBat, true));
    scriptsFolder.file(`create_photoshop_${year}_desktop_shortcut.bat`, encodeWindowsText(shortcutBat, true));
    scriptsFolder.file(`build_photoshop_${year}_toggle_exe.bat`, encodeWindowsText(exeBuilderBat, true));
  }

  // 4. Distribution Readme & User Guide
  zip.file('README_배포안내.txt', encodeWindowsText(readmeText, true));

  // Generate ZIP file and trigger download
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Photoshop_${year}_Language_Switcher_${versionTag}_Distribution_Suite.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
