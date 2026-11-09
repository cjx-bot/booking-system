@echo off
chcp 65001 >nul
title 预约系统 - 本地预览
cd /d "%~dp0"

echo ============================================
echo    预约系统  本地预览
echo ============================================
echo.
echo    启动后浏览器会自动打开：
echo    http://localhost:3000
echo.
echo    关闭这个窗口 = 停止服务
echo ============================================
echo.

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [错误] 没找到 pnpm。
  echo 请先在命令行执行：npm install -g pnpm
  echo.
  pause
  exit /b 1
)

start "" cmd /c "timeout /t 12 >nul & start http://localhost:3000"
call pnpm dev
