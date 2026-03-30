@echo off
setlocal

REM === 设置 NSIS 安装器路径 ===
set TAURI_BUNDLER__NSIS__BIN=C:\Program Files (x86)\NSIS\makensis.exe

REM === 打印确认环境变量 ===
echo Using NSIS at: %TAURI_BUNDLER__NSIS__BIN%

REM === 切换到当前目录 ===
cd /d %~dp0

REM === 打包构建项目 ===
echo Running: npm run tauri build ...
npm run tauri build

REM === 结束 ===
pause
