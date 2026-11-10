@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 预约系统 - 本地预览

echo.
echo  ============================================
echo    预约系统  本地预览
echo  ============================================
echo.
echo    启动成功后浏览器会自动打开
echo    http://localhost:3000
echo.
echo    关闭这个窗口 = 停止服务
echo.

if not exist "runtime\node.exe" (
  echo   [错误] 项目文件不完整：找不到 runtime\node.exe
  echo   请重新获取完整项目目录。
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\next\dist\bin\next" (
  echo   [错误] 依赖没有安装：找不到 node_modules
  echo   请在项目目录执行 pnpm install
  echo.
  pause
  exit /b 1
)

if not exist ".env" (
  echo   [提示] 缺少 .env，正在从 .env.example 生成
  copy ".env.example" ".env" >nul
)

netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo   [提示] 3000 端口已被占用
  echo.
  echo   多半是预约系统已经在跑了。
  echo   先看看浏览器能不能打开 http://localhost:3000
  echo   能打开就直接用，不用再双击这个文件。
  echo.
  echo   如果打不开，说明上次的窗口没关干净：
  echo   关掉那个黑窗口，再双击本文件。
  echo.
  pause
  exit /b 1
)

echo  正在启动，首次启动要编译，稍等几秒
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 8; Start-Process 'http://localhost:3000'"

"%~dp0runtime\node.exe" "node_modules\next\dist\bin\next" dev --port 3000

echo.
echo  服务已停止
pause
