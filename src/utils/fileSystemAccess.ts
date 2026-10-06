import { DetectedFileInfo, DetectedPhotoshopInstallation, LanguageMode } from '../types';
import { getOldDatFileName, PHOTOSHOP_VERSIONS } from './photoshopHelper';
import { ILLUSTRATOR_VERSIONS } from './illustratorHelper';
import { detectLocaleFromDatFileName, getLocaleByCode } from './localeHelper';

/**
 * Check if the browser supports the File System Access API
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Check if the application is currently running inside an iframe (e.g. AI Studio preview)
 * Note: Chromium W3C security policy prohibits showDirectoryPicker inside cross-origin iframes.
 */
export function isRunningInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true; // Threw DOMException on reading window.top -> cross-origin iframe
  }
}

/**
 * Check whether showDirectoryPicker is truly allowed in the current browsing context
 */
export function isDirectoryPickerAllowed(): boolean {
  return isFileSystemAccessSupported() && !isRunningInIframe();
}

/**
 * Prompt user to select directory and inspect files
 */
export async function openPhotoshopDirectory(targetFileName: string): Promise<{
  directoryHandle: FileSystemDirectoryHandle;
  info: DetectedFileInfo;
}> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('이 브라우저는 폴더 직접 접근 API를 지원하지 않습니다. 크롬(Chrome)이나 엣지(Edge) 브라우저를 사용하시거나 배치(.bat) 파일을 이용해 주세요.');
  }

  if (isRunningInIframe()) {
    throw new Error('CROSS_ORIGIN_IFRAME_RESTRICTED');
  }

  // @ts-expect-error window.showDirectoryPicker is experimental but standard in Chromium
  const directoryHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
    mode: 'readwrite',
    startIn: 'desktop',
  });

  const info = await scanDirectoryForLanguageFiles(directoryHandle, targetFileName);
  return { directoryHandle, info };
}

/**
 * Inspect an Illustrator AMT directory handle for application.xml and detect language
 */
async function inspectIllustratorAmtHandle(
  amtHandle: FileSystemDirectoryHandle,
  folderName: string,
  fullPathName: string
): Promise<DetectedPhotoshopInstallation | null> {
  try {
    const fileHandle = await amtHandle.getFileHandle('application.xml');
    const file = await fileHandle.getFile();
    const text = await file.text();

    let currentMode: LanguageMode = 'unknown';
    let koreanExists = false;
    let englishExists = false;

    if (text.includes('ko_KR')) {
      currentMode = 'korean';
      koreanExists = true;
    } else if (text.includes('en_US') || text.includes('en_GB')) {
      currentMode = 'english';
      englishExists = true;
    } else {
      currentMode = 'unknown';
    }

    const matchedPreset = ILLUSTRATOR_VERSIONS.find(
      (v) =>
        folderName.toLowerCase().includes(v.folderName.toLowerCase()) ||
        folderName.toLowerCase().includes(v.name.toLowerCase()) ||
        (v.year !== 'CS6' && folderName.includes(String(v.year)))
    );

    const versionName = matchedPreset ? matchedPreset.name : folderName;
    const id = matchedPreset ? matchedPreset.id : `ai_${folderName.replace(/\s+/g, '_')}`;

    return {
      id,
      versionName,
      folderName,
      supportFilesPath: fullPathName,
      datFileName: 'application.xml',
      oldDatFileName: 'application.xml.bak',
      currentMode,
      supportDirHandle: amtHandle,
      koreanFileExists: koreanExists,
      englishFileExists: englishExists,
      isSelected: true,
      appType: 'illustrator',
    };
  } catch {
    return null;
  }
}

/**
 * Scan a directory for Illustrator installations
 */
export async function scanDirectoryForIllustratorInstallations(
  rootHandle: FileSystemDirectoryHandle
): Promise<DetectedPhotoshopInstallation[]> {
  const results: DetectedPhotoshopInstallation[] = [];
  const rootName = rootHandle.name;

  // Case 1: The selected folder IS ALREADY the 'AMT' directory
  if (rootName.toLowerCase() === 'amt') {
    const detected = await inspectIllustratorAmtHandle(rootHandle, 'Illustrator (AMT)', rootName);
    if (detected) results.push(detected);
    return results;
  }

  // Case 2: Selected folder is a single Illustrator root (e.g. 'Adobe Illustrator 2024')
  if (rootName.toLowerCase().includes('illustrator')) {
    // 2-a: Standard 64-bit modern (Support Files\Contents\Windows\AMT)
    try {
      const sup = await rootHandle.getDirectoryHandle('Support Files');
      const contents = await sup.getDirectoryHandle('Contents');
      const win = await contents.getDirectoryHandle('Windows');
      const amt = await win.getDirectoryHandle('AMT');
      const detected = await inspectIllustratorAmtHandle(
        amt,
        rootName,
        `${rootName}\\Support Files\\Contents\\Windows\\AMT`
      );
      if (detected) {
        results.push(detected);
        return results;
      }
    } catch {
      // Continue
    }

    // 2-b: Direct AMT folder under root or Support Files\AMT
    try {
      const amt = await rootHandle.getDirectoryHandle('AMT');
      const detected = await inspectIllustratorAmtHandle(amt, rootName, `${rootName}\\AMT`);
      if (detected) {
        results.push(detected);
        return results;
      }
    } catch {
      // Continue
    }

    try {
      const sup = await rootHandle.getDirectoryHandle('Support Files');
      const amt = await sup.getDirectoryHandle('AMT');
      const detected = await inspectIllustratorAmtHandle(
        amt,
        rootName,
        `${rootName}\\Support Files\\AMT`
      );
      if (detected) {
        results.push(detected);
        return results;
      }
    } catch {
      // Continue
    }
  }

  // Case 3: Selected folder is 'Adobe' parent directory
  const dirAny = rootHandle as any;
  if (typeof dirAny.entries === 'function') {
    for await (const [childName, childHandle] of dirAny.entries()) {
      if (childHandle.kind === 'directory' && childName.toLowerCase().includes('illustrator')) {
        // 3-a: Support Files\Contents\Windows\AMT
        try {
          const sup = await childHandle.getDirectoryHandle('Support Files');
          const contents = await sup.getDirectoryHandle('Contents');
          const win = await contents.getDirectoryHandle('Windows');
          const amt = await win.getDirectoryHandle('AMT');
          const detected = await inspectIllustratorAmtHandle(
            amt,
            childName,
            `${rootName}\\${childName}\\Support Files\\Contents\\Windows\\AMT`
          );
          if (detected) {
            results.push(detected);
            continue;
          }
        } catch {
          // not found
        }

        // 3-b: Direct AMT under child
        try {
          const amt = await childHandle.getDirectoryHandle('AMT');
          const detected = await inspectIllustratorAmtHandle(
            amt,
            childName,
            `${rootName}\\${childName}\\AMT`
          );
          if (detected) {
            results.push(detected);
          }
        } catch {
          // not found
        }
      }
    }
  }

  return results;
}

/**
 * Toggle language in an Illustrator AMT application.xml file
 */
export async function toggleIllustratorXmlLanguage(
  amtHandle: FileSystemDirectoryHandle,
  targetMode?: 'korean' | 'english',
  targetLocale: string = 'ko_KR'
): Promise<LanguageMode> {
  const fileHandle = await amtHandle.getFileHandle('application.xml');
  const file = await fileHandle.getFile();
  const text = await file.text();

  let newText = text;
  let newMode: LanguageMode = 'korean';

  const hasNative = text.includes(targetLocale) || text.includes('ko_KR');
  const hasEnglish = text.includes('en_US') || text.includes('en_GB');

  if (targetMode === 'english' || (!targetMode && hasNative)) {
    if (text.includes('<Data key="installedLanguages">')) {
      newText = text.replace(/<Data key="installedLanguages">.*?<\/Data>/g, '<Data key="installedLanguages">en_US</Data>');
    } else {
      newText = text.replace(new RegExp(targetLocale, 'g'), 'en_US').replace(/ko_KR/g, 'en_US');
    }
    newMode = 'english';
  } else if (targetMode === 'korean' || (!targetMode && hasEnglish)) {
    if (text.includes('<Data key="installedLanguages">')) {
      newText = text.replace(/<Data key="installedLanguages">.*?<\/Data>/g, `<Data key="installedLanguages">${targetLocale}</Data>`);
    } else {
      newText = text.replace(/en_US/g, targetLocale).replace(/en_GB/g, targetLocale);
    }
    newMode = 'korean';
  } else {
    // Fallback toggle
    if (hasNative) {
      newText = text.replace(new RegExp(targetLocale, 'g'), 'en_US').replace(/ko_KR/g, 'en_US');
      newMode = 'english';
    } else {
      newText = text.replace(/en_US/g, targetLocale);
      newMode = 'korean';
    }
  }

  // Write changes
  const writable = await (fileHandle as any).createWritable();
  await writable.write(newText);
  await writable.close();

  return newMode;
}

/**
 * Prompt user to select an Adobe parent directory or a Photoshop directory
 * and automatically scan and detect ALL installed Photoshop versions!
 */
export async function openAndScanAllPhotoshopVersions(): Promise<{
  parentHandle: FileSystemDirectoryHandle;
  installations: DetectedPhotoshopInstallation[];
}> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('이 브라우저는 폴더 직접 접근 API를 지원하지 않습니다. 크롬(Chrome)이나 엣지(Edge) 브라우저를 사용하시거나 자동 감지 스크립트를 이용해 주세요.');
  }

  if (isRunningInIframe()) {
    throw new Error('CROSS_ORIGIN_IFRAME_RESTRICTED');
  }

  // @ts-expect-error window.showDirectoryPicker is experimental but standard in Chromium
  const parentHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
    mode: 'readwrite',
    startIn: 'desktop',
  });

  const installations = await scanDirectoryForPhotoshopInstallations(parentHandle);
  return { parentHandle, installations };
}

/**
 * Helper to inspect a single 'Support Files' directory handle for DAT language files
 */
async function inspectSupportFilesHandle(
  supportHandle: FileSystemDirectoryHandle,
  folderName: string,
  fullPathName: string
): Promise<DetectedPhotoshopInstallation | null> {
  const isCs6 = folderName.toLowerCase().includes('cs6');
  let targetDat = isCs6 ? 'tw10428.dat' : 'tw10428_Photoshop_ko_KR.dat';
  let oldDat = isCs6 ? 'old_tw10428.dat' : 'old_tw10428_Photoshop_ko_KR.dat';

  let koreanFileExists = false;
  let englishFileExists = false;
  let detectedLocaleCode = 'ko_KR';

  try {
    const dirAny = supportHandle as any;
    if (typeof dirAny.entries === 'function') {
      for await (const [name, handle] of dirAny.entries()) {
        if (handle.kind === 'file') {
          const lowerName = name.toLowerCase();
          if (lowerName === 'tw10428.dat') {
            targetDat = 'tw10428.dat';
            oldDat = 'old_tw10428.dat';
            koreanFileExists = true;
          } else if (lowerName === 'old_tw10428.dat') {
            targetDat = 'tw10428.dat';
            oldDat = 'old_tw10428.dat';
            englishFileExists = true;
          } else if (lowerName.startsWith('tw10428_photoshop_') && lowerName.endsWith('.dat')) {
            targetDat = name;
            oldDat = `old_${name}`;
            koreanFileExists = true;
            const code = detectLocaleFromDatFileName(name);
            if (code) detectedLocaleCode = code;
          } else if (lowerName.startsWith('old_tw10428_photoshop_') && lowerName.endsWith('.dat')) {
            oldDat = name;
            targetDat = name.replace(/^old_/i, '');
            englishFileExists = true;
            const code = detectLocaleFromDatFileName(targetDat);
            if (code) detectedLocaleCode = code;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Failed reading support directory entries in ${folderName}:`, err);
  }

  if (!koreanFileExists && !englishFileExists) {
    return null;
  }

  let currentMode: LanguageMode = 'not_found';
  if (koreanFileExists && !englishFileExists) {
    currentMode = 'korean';
  } else if (!koreanFileExists && englishFileExists) {
    currentMode = 'english';
  } else if (koreanFileExists && englishFileExists) {
    currentMode = 'korean';
  }

  // Try to match preset
  const matchedPreset = PHOTOSHOP_VERSIONS.find((v) =>
    folderName.toLowerCase().includes(v.folderName.toLowerCase()) ||
    folderName.toLowerCase().includes(v.name.toLowerCase()) ||
    (v.year !== 'CS6' && folderName.includes(String(v.year)))
  );

  const locPreset = getLocaleByCode(detectedLocaleCode);
  const versionName = matchedPreset ? matchedPreset.name : folderName;
  const id = matchedPreset ? matchedPreset.id : `detected_${folderName.replace(/\s+/g, '_')}`;

  return {
    id,
    versionName,
    folderName,
    supportFilesPath: fullPathName,
    datFileName: targetDat,
    oldDatFileName: oldDat,
    currentMode,
    supportDirHandle: supportHandle,
    koreanFileExists,
    englishFileExists,
    isSelected: true,
    detectedLocale: detectedLocaleCode,
    detectedLocaleName: locPreset.name,
  };
}

/**
 * Recursively or hierarchically scan a directory to discover all Photoshop installations
 */
export async function scanDirectoryForPhotoshopInstallations(
  rootHandle: FileSystemDirectoryHandle
): Promise<DetectedPhotoshopInstallation[]> {
  const results: DetectedPhotoshopInstallation[] = [];
  const rootName = rootHandle.name;

  // Case 1: The selected folder IS ALREADY the 'Support Files' directory
  if (rootName.toLowerCase() === 'support files') {
    const detected = await inspectSupportFilesHandle(rootHandle, 'Photoshop (Selected Folder)', rootName);
    if (detected) {
      results.push(detected);
    }
    return results;
  }

  // Case 2: The selected folder is a single Photoshop root (e.g. 'Adobe Photoshop 2024')
  if (rootName.toLowerCase().includes('photoshop')) {
    try {
      const locales = await rootHandle.getDirectoryHandle('Locales');
      const localesAny = locales as any;
      for await (const [localeName, localeHandle] of localesAny.entries()) {
        if (localeHandle.kind === 'directory') {
          try {
            const support = await localeHandle.getDirectoryHandle('Support Files');
            const detected = await inspectSupportFilesHandle(
              support,
              rootName,
              `${rootName}\\Locales\\${localeName}\\Support Files`
            );
            if (detected) {
              results.push(detected);
            }
          } catch {}
        }
      }
      if (results.length > 0) return results;
    } catch {
      // Locales not found
    }
  }

  // Case 3: The selected folder is 'Adobe' parent directory (e.g. 'C:\Program Files\Adobe' or '/Applications')
  const dirAny = rootHandle as any;
  if (typeof dirAny.entries === 'function') {
    for await (const [childName, childHandle] of dirAny.entries()) {
      if (childHandle.kind === 'directory' && childName.toLowerCase().includes('photoshop')) {
        try {
          const locales = await childHandle.getDirectoryHandle('Locales');
          const localesAny = locales as any;
          for await (const [localeName, localeHandle] of localesAny.entries()) {
            if (localeHandle.kind === 'directory') {
              try {
                const support = await localeHandle.getDirectoryHandle('Support Files');
                const detected = await inspectSupportFilesHandle(
                  support,
                  childName,
                  `${rootName}\\${childName}\\Locales\\${localeName}\\Support Files`
                );
                if (detected) {
                  results.push(detected);
                }
              } catch {}
            }
          }
        } catch {
          // Subdirectory was not a valid photoshop installation or lacked Locales
        }
      }
    }
  }

  // Sort results by version year descending (e.g. 2026, 2025, 2024, CS6)
  results.sort((a, b) => b.versionName.localeCompare(a.versionName));

  return results;
}

/**
 * Scan directory to find whether Korean or English (old_*) file is currently present
 */
export async function scanDirectoryForLanguageFiles(
  directoryHandle: FileSystemDirectoryHandle,
  targetFileName: string
): Promise<DetectedFileInfo> {
  let activeTarget = targetFileName;
  let oldFileName = getOldDatFileName(targetFileName);
  let koreanFileExists = false;
  let englishFileExists = false;
  let detectedLocale: string | undefined = undefined;

  let anyFoundDat = '';
  let anyFoundOld = '';

  try {
    const dirAny = directoryHandle as any;
    if (typeof dirAny.entries === 'function') {
      for await (const [name, handle] of dirAny.entries()) {
        if (handle.kind === 'file') {
          const lowerName = name.toLowerCase();
          if (lowerName === targetFileName.toLowerCase()) {
            koreanFileExists = true;
          } else if (lowerName === oldFileName.toLowerCase()) {
            englishFileExists = true;
          } else if (lowerName.startsWith('tw10428') && lowerName.endsWith('.dat')) {
            anyFoundDat = name;
          } else if (lowerName.startsWith('old_tw10428') && lowerName.endsWith('.dat')) {
            anyFoundOld = name;
          }
        }
      }
    }

    // If expected filename wasn't found but another locale's dat was found, adopt it
    if (!koreanFileExists && !englishFileExists) {
      if (anyFoundDat) {
        koreanFileExists = true;
        activeTarget = anyFoundDat;
        oldFileName = `old_${anyFoundDat}`;
        const loc = detectLocaleFromDatFileName(anyFoundDat);
        if (loc) detectedLocale = loc;
      } else if (anyFoundOld) {
        englishFileExists = true;
        oldFileName = anyFoundOld;
        activeTarget = anyFoundOld.replace(/^old_/i, '');
        const loc = detectLocaleFromDatFileName(activeTarget);
        if (loc) detectedLocale = loc;
      }
    } else {
      const loc = detectLocaleFromDatFileName(activeTarget);
      if (loc) detectedLocale = loc;
    }
  } catch (err) {
    console.error('Error scanning directory entries:', err);
  }

  let currentMode: DetectedFileInfo['currentMode'] = 'not_found';
  if (koreanFileExists && !englishFileExists) {
    currentMode = 'korean';
  } else if (!koreanFileExists && englishFileExists) {
    currentMode = 'english';
  } else if (koreanFileExists && englishFileExists) {
    currentMode = 'korean'; // Both exist, original takes precedence
  }

  return {
    koreanFileExists,
    englishFileExists,
    koreanFileName: activeTarget,
    englishFileName: oldFileName,
    currentMode,
    folderName: directoryHandle.name,
    lastChecked: new Date(),
    detectedLocale,
  };
}

/**
 * Rename file using FileSystemHandle move or copy-delete fallback
 */
async function renameFileInDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  oldName: string,
  newName: string
): Promise<void> {
  // Try modern .move() API first
  try {
    const fileHandle = await directoryHandle.getFileHandle(oldName);
    // @ts-expect-error move is available in Chrome 111+
    if (typeof fileHandle.move === 'function') {
      // @ts-expect-error move
      await fileHandle.move(newName);
      return;
    }
  } catch (err) {
    console.warn('move API failed or not supported, trying copy+delete fallback', err);
  }

  // Fallback: Read old file, create new file, copy content, delete old file
  const oldFileHandle = await directoryHandle.getFileHandle(oldName);
  const oldFile = await oldFileHandle.getFile();
  const fileData = await oldFile.arrayBuffer();

  const newFileHandle: any = await directoryHandle.getFileHandle(newName, { create: true });
  const writable = await newFileHandle.createWritable();
  await writable.write(fileData);
  await writable.close();

  // Remove old file
  await directoryHandle.removeEntry(oldName);
}

/**
 * Switch to English mode directly in directory
 */
export async function applyEnglishMode(
  directoryHandle: FileSystemDirectoryHandle,
  targetFileName: string
): Promise<DetectedFileInfo> {
  const oldFileName = getOldDatFileName(targetFileName);
  
  // Verify permissions
  const dirAny = directoryHandle as any;
  if (typeof dirAny.requestPermission === 'function') {
    const status = await dirAny.requestPermission({ mode: 'readwrite' });
    if (status !== 'granted') {
      throw new Error('폴더 읽기/쓰기 권한이 허용되지 않았습니다.');
    }
  }

  await renameFileInDirectory(directoryHandle, targetFileName, oldFileName);
  return await scanDirectoryForLanguageFiles(directoryHandle, targetFileName);
}

/**
 * Switch to Korean mode directly in directory
 */
export async function applyKoreanMode(
  directoryHandle: FileSystemDirectoryHandle,
  targetFileName: string
): Promise<DetectedFileInfo> {
  const oldFileName = getOldDatFileName(targetFileName);

  // Verify permissions
  const dirAny = directoryHandle as any;
  if (typeof dirAny.requestPermission === 'function') {
    const status = await dirAny.requestPermission({ mode: 'readwrite' });
    if (status !== 'granted') {
      throw new Error('폴더 읽기/쓰기 권한이 허용되지 않았습니다.');
    }
  }

  await renameFileInDirectory(directoryHandle, oldFileName, targetFileName);
  return await scanDirectoryForLanguageFiles(directoryHandle, targetFileName);
}

/**
 * Toggle language for a single detected installation handle (Photoshop or Illustrator)
 */
export async function toggleSingleDetectedInstallation(
  inst: DetectedPhotoshopInstallation
): Promise<DetectedPhotoshopInstallation> {
  if (!inst.supportDirHandle) {
    throw new Error(`[${inst.versionName}] 폴더에 직접 접근할 수 없습니다.`);
  }

  if (inst.appType === 'illustrator') {
    const newMode = await toggleIllustratorXmlLanguage(inst.supportDirHandle);
    return {
      ...inst,
      currentMode: newMode,
      koreanFileExists: newMode === 'korean',
      englishFileExists: newMode === 'english',
    };
  }

  if (inst.currentMode === 'korean') {
    await applyEnglishMode(inst.supportDirHandle, inst.datFileName);
    return {
      ...inst,
      currentMode: 'english',
      koreanFileExists: false,
      englishFileExists: true,
    };
  } else if (inst.currentMode === 'english') {
    await applyKoreanMode(inst.supportDirHandle, inst.datFileName);
    return {
      ...inst,
      currentMode: 'korean',
      koreanFileExists: true,
      englishFileExists: false,
    };
  } else {
    throw new Error(`[${inst.versionName}] 변경할 언어 파일이 발견되지 않았습니다.`);
  }
}

/**
 * Batch toggle all selected Photoshop or Illustrator installations
 */
export async function batchApplyLanguageMode(
  installations: DetectedPhotoshopInstallation[],
  targetMode: 'korean' | 'english' | 'toggle'
): Promise<DetectedPhotoshopInstallation[]> {
  const updated: DetectedPhotoshopInstallation[] = [];

  for (const inst of installations) {
    if (!inst.supportDirHandle) {
      updated.push(inst);
      continue;
    }

    try {
      if (inst.appType === 'illustrator') {
        const modeArg = targetMode === 'toggle' ? undefined : targetMode;
        const newMode = await toggleIllustratorXmlLanguage(inst.supportDirHandle, modeArg);
        updated.push({
          ...inst,
          currentMode: newMode,
          koreanFileExists: newMode === 'korean',
          englishFileExists: newMode === 'english',
        });
        continue;
      }

      if (targetMode === 'korean') {
        if (inst.currentMode === 'english') {
          await applyKoreanMode(inst.supportDirHandle, inst.datFileName);
          updated.push({
            ...inst,
            currentMode: 'korean',
            koreanFileExists: true,
            englishFileExists: false,
          });
        } else {
          updated.push(inst);
        }
      } else if (targetMode === 'english') {
        if (inst.currentMode === 'korean') {
          await applyEnglishMode(inst.supportDirHandle, inst.datFileName);
          updated.push({
            ...inst,
            currentMode: 'english',
            koreanFileExists: false,
            englishFileExists: true,
          });
        } else {
          updated.push(inst);
        }
      } else {
        // Toggle
        const toggled = await toggleSingleDetectedInstallation(inst);
        updated.push(toggled);
      }
    } catch (err) {
      console.error(`Failed to change mode for ${inst.versionName}:`, err);
      updated.push(inst);
    }
  }

  return updated;
}
