@echo off
echo Building camunda-worker Docker image for linux/amd64...
docker buildx build --platform linux/amd64 -t camunda-worker:latest --load .
if %errorlevel% equ 0 (
    echo Build successful!
    echo Run: docker run -p 3000:3000 camunda-worker:latest
) else (
    echo Build failed!
)
pause
