@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo   发布到线上
echo   ==================================================
echo.

where npx >nul 2>nul
if errorlevel 1 (
  echo   [错误] 找不到 npx，说明 Node.js 没装好或者不在 PATH 里。
  echo   先把 Node.js 装好再试。
  echo.
  pause
  exit /b 1
)

echo   正在构建并上传，大概 3-5 分钟，这个窗口别关。
echo   中间出现一堆日志是正常的，最后看到 "Deploy is live!" 就成了。
echo.

call npx --yes netlify-cli@latest deploy --build --prod

if errorlevel 1 (
  echo.
  echo   [失败] 部署没成功，把上面的报错发我。
) else (
  echo.
  echo   [完成] 线上地址：https://xing-booking-system.netlify.app
  echo   手机和电脑都能直接打开，链接可以直接发给别人。
)

echo.
pause
