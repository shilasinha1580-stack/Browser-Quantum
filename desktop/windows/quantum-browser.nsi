; Quantum Browser NSIS Installer Script
; Supports both 32-bit (x86) and 64-bit (x64) Windows targets

!define PRODUCT_NAME "Quantum Browser"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Quantum Browser Team"
!define PRODUCT_WEB_SITE "https://github.com/quantum-browser/quantum-browser"
!define PRODUCT_DIR_REGKEY "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\quantum.exe"
!define PRODUCT_UNINST_KEY "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${PRODUCT_NAME}"

!include "MUI2.nsh"

; Define UI elements
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "output\\quantum-browser-${PRODUCT_VERSION}-setup-${ARCH}.exe"
InstallDir "$PROGRAMFILES64\\QuantumBrowser"
!if "${ARCH}" == "x86"
  InstallDir "$PROGRAMFILES\\QuantumBrowser"
!endif

ShowInstDetails show
ShowUnInstDetails show

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "..\\..\\public\\logo.ico"
!define MUI_UNICON "..\\..\\public\\logo.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\\..\\LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite try
  File /r "bin\\${ARCH}\\*.*"

  ; Create Shortcuts
  CreateDirectory "$SMPROGRAMS\\Quantum Browser"
  CreateShortcut "$SMPROGRAMS\\Quantum Browser\\Quantum Browser.lnk" "$INSTDIR\\quantum.exe"
  CreateShortcut "$DESKTOP\\Quantum Browser.lnk" "$INSTDIR\\quantum.exe"
SectionEnd

Section -Post
  WriteUninstaller "$INSTDIR\\uninst.exe"
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\\quantum.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\\uninst.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd
