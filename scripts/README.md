# 🛠️ Automated Build & Deployment Scripts (Windows)

This directory contains automated build, Git repository setup, and GitHub Pages deployment scripts for the **Adobe Photoshop & Illustrator Language Switcher** suite.

## 📋 Automation Pipeline Overview

| Script | Purpose | Encoding | Language | Output Format / Destination |
|---|---|---|---|---|
| `build.bat` | Compiles Web SPA and Windows Native Executables | Windows CRLF (`\r\n`) | English | `build\Photoshop_Language_Switcher_vX.Y.Z.exe` |
| `github_setup.bat` | Initializes Git repository, checks .gitignore, stages files, and sets release tags | Windows CRLF (`\r\n`) | English | Local Git `main` branch & `vX.Y.Z` tag |
| `deploy_gh_pages.bat` | One-click deployment to GitHub Pages via Actions or direct `gh-pages` branch | Windows CRLF (`\r\n`) | English | Live GitHub Pages Production Site |

---

## 🚀 How to Run the Scripts

### 1. Build Native Executables (`build.bat`)
Run from project root or `scripts\` directory:
```cmd
build.bat
:: Or silent / unattended build:
build.bat /silent
```

### 2. Setup GitHub Repository (`github_setup.bat`)
Automates Git initialization, staging required source directories, setting the `main` branch, creating release tags, and linking to your GitHub repository:
```cmd
github_setup.bat
```

### 3. Deploy to GitHub Pages (`deploy_gh_pages.bat`)
Provides two deployment strategies:
- **Strategy 1 (Recommended): GitHub Actions CI/CD**
  Pushes code to `main` branch where `.github/workflows/deploy.yml` automatically compiles and hosts on GitHub Pages.
- **Strategy 2: Direct Local Build & Push to `gh-pages`**
  Builds Vite SPA locally, adds `.nojekyll` and `404.html`, and force-pushes `dist\` to the `gh-pages` branch.
```cmd
deploy_gh_pages.bat
```
- **Live Website URL**: [https://ahbiyout.github.io/photoshop-language-switcher/](https://ahbiyout.github.io/photoshop-language-switcher/)

---

## 📂 Repository Contents for GitHub Upload

| Path | Description | Upload Status |
|---|---|---|
| `src/` | Complete React TypeScript frontend application source code | ✅ Required |
| `docs/` | Architecture specs, user guides, troubleshooting, and patch notes | ✅ Required |
| `public/` | Web manifest, favicon, icons, `.nojekyll`, and `404.html` | ✅ Required |
| `scripts/` | Automated build and deployment batch scripts | ✅ Required |
| `.github/` | GitHub Actions CI/CD workflows (`ci.yml`, `deploy.yml`) | ✅ Required |
| `package.json`, `tsconfig.json`, `vite.config.ts` | Project configurations | ✅ Required |
| `README.md`, `LICENSE`, `AGENTS.md` | Root documentation and open-source license | ✅ Required |
| `node_modules/`, `dist/`, `build/`, `*.log` | Generated outputs and caches | ❌ Excluded (.gitignore) |

---

## 📦 Generated Artifacts

The scripts automatically detect the semantic version from `package.json` and append the exact version to the filenames:

- `build\Photoshop_Language_Switcher_v2.8.0.exe` (Standalone Photoshop Language Switcher with PE Details)
- `build\Adobe_Language_Switcher_Suite_v2.8.0.exe` (Complete Master Suite Switcher)
- `build\Photoshop_Language_Switcher_v2.8.0.bat` (Standalone batch launcher)
- `dist\` (Vite production Web SPA bundle with `.nojekyll` and `404.html`)

---

## 👤 Developer & Official Channels

- **Developer:** AhBiYout
- **Official Google Blog:** [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
- **Organization:** [https://www.cisnet.co.kr](https://www.cisnet.co.kr) (CIS)
- **Copyright:** Copyright © 2026 AhBiYout. All rights reserved.
