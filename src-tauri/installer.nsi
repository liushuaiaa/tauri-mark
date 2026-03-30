!include "MUI2.nsh"
!include "FileFunc.nsh"


!define PRODUCT_NAME "备忘录"
!define APP_EXE "tauri-mark.exe"
!define ICON_FILE "icon.ico"
!define UNINSTALLER "uninstall.exe"
!define INSTALL_LOG "install-log.txt"
!define REG_KEY "Software\${PRODUCT_NAME}"
!define INSTALL_DIR_REG_VALUE "Install_Dir"
!define MUI_ICON "..\..\..\..\icons\${ICON_FILE}"

OutFile "..\..\bundle\nsis\${PRODUCT_NAME}_x64-setup.exe"

SilentInstall normal
RequestExecutionLevel admin

InstallDirRegKey HKCU "${REG_KEY}" "${INSTALL_DIR_REG_VALUE}"
InstallDir "$PROGRAMFILES64\${PRODUCT_NAME}"

Var SilentInstallMode
Var PreviousInstallDir

Function .onInit
  StrCpy $SilentInstallMode 0
  IfSilent 0 +2
    StrCpy $SilentInstallMode 1

  Exec 'taskkill /F /IM ${APP_EXE} /T >nul 2>&1'
  Sleep 1000

  ReadRegStr $PreviousInstallDir HKCU "${REG_KEY}" "${INSTALL_DIR_REG_VALUE}"
  StrCmp $SilentInstallMode 1 0 +3
    StrCmp $PreviousInstallDir "" 0 +2
      StrCpy $INSTDIR $PreviousInstallDir
FunctionEnd

Function DirectoryLeave
  StrCmp $SilentInstallMode 1 0 +1
    Abort
FunctionEnd

!insertmacro MUI_PAGE_WELCOME
PageEx directory
  PageCallbacks "" DirectoryLeave
PageExEnd
!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_SHOWREADME
!define MUI_FINISHPAGE_SHOWREADME_TEXT "创建桌面快捷方式"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION CreateShortcutFunc

!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "立即启动 ${PRODUCT_NAME}"
!define MUI_FINISHPAGE_RUN_FUNCTION LaunchAppFunc

!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "SimpChinese"

Section "Install"
  SetOverwrite on
  SetOutPath "$INSTDIR"
  File /oname=${APP_EXE} "..\..\${APP_EXE}"
  File /oname=$INSTDIR\${ICON_FILE} "..\..\..\..\icons\${ICON_FILE}"
  WriteUninstaller "$INSTDIR\${UNINSTALLER}"

  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortcut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${ICON_FILE}"
  CreateShortcut "$SMPROGRAMS\${PRODUCT_NAME}\卸载 ${PRODUCT_NAME}.lnk" "$INSTDIR\${UNINSTALLER}"

  FileOpen $R0 "$INSTDIR\\${INSTALL_LOG}" w
  FileWrite $R0 "SilentInstallMode=$SilentInstallMode$\r$\n"
  FileWrite $R0 "INSTDIR=$INSTDIR$\r$\n"
  FileWrite $R0 "CMDLINE=$CMDLINE$\r$\n"
  FileClose $R0

  StrCmp $SilentInstallMode 1 0 +7
    Sleep 3000
    IfFileExists "$INSTDIR\\${APP_EXE}" 0 +3
      FileOpen $R1 "$INSTDIR\\${INSTALL_LOG}" a
      FileWrite $R1 "Launching app after silent install...\r\n"
      FileClose $R1
      ExecShell "open" "$INSTDIR\\${APP_EXE}"
SectionEnd

Section -Post
  WriteRegStr HKCU "Software\${PRODUCT_NAME}" "Install_Dir" "$INSTDIR"

  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" '"$INSTDIR\${UNINSTALLER}"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\${ICON_FILE}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "0.1.0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  ExecWait 'taskkill /F /IM ${APP_EXE} /T' $0
  Sleep 1000

  Delete "$INSTDIR\\${APP_EXE}"
  Delete "$INSTDIR\\${ICON_FILE}"
  Delete "$INSTDIR\\${UNINSTALLER}"
  Delete "$INSTDIR\\${INSTALL_LOG}"

  Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\卸载 ${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCT_NAME}"

  Delete "$DESKTOP\\${PRODUCT_NAME}.lnk"

  RMDir /r "$INSTDIR"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  DeleteRegKey HKCU "${REG_KEY}"
SectionEnd

Function CreateShortcutFunc
  CreateShortcut "$DESKTOP\\${PRODUCT_NAME}.lnk" "$INSTDIR\\${APP_EXE}" "" "$INSTDIR\\${ICON_FILE}"
FunctionEnd

Function LaunchAppFunc
  ExecShell "open" "$INSTDIR\\${APP_EXE}"
FunctionEnd
