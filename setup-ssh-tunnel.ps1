# SSH Tunnel Configuration Script
# Run as Administrator in Windows PowerShell

$ErrorActionPreference = "Stop"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "SSH Tunnel Auto Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check SSH directory
$sshDir = "$env:USERPROFILE\.ssh"
if (!(Test-Path $sshDir)) {
    Write-Host "Creating .ssh directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

# Update SSH config to use new key
$configFile = "$sshDir\config"
if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    $config = $config -replace 'IdentityFile .*?k3s-tunnel(?!"-new)', 'IdentityFile C:\Users\$env:USERNAME\.ssh\k3s-tunnel-new'
    Set-Content -Path $configFile -Value $config -Encoding ASCII
    Write-Host "[OK] SSH config updated to use new key" -ForegroundColor Green
}

# 2. Generate key if not exists
$keyFile = "$sshDir\k3s-tunnel"
$pubFile = "$keyFile.pub"

if (!(Test-Path $keyFile)) {
    Write-Host "Generating SSH key pair..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $keyFile -N `"`"`"
    Write-Host "[OK] Key generated" -ForegroundColor Green
} else {
    Write-Host "[OK] SSH key already exists" -ForegroundColor Green
}

# 3. Display public key
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Public Key (Copy to K3s server)" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
$pubKey = Get-Content $pubFile
Write-Host $pubKey -ForegroundColor Yellow
Write-Host ""

# 4. Prompt to copy public key to K3s
Write-Host "Run these commands on K3s server:" -ForegroundColor Yellow
Write-Host ""
Write-Host "mkdir -p ~/.ssh" -ForegroundColor White
Write-Host "chmod 700 ~/.ssh" -ForegroundColor White
Write-Host "echo `"$pubKey`" >> ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host "chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host ""

# 5. Test connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"

try {
    $testResult = & ssh -o BatchMode=yes -o ConnectTimeout=5 root@192.168.109.66 "echo Connected" 2>&1
} finally {
    $ErrorActionPreference = $oldErrorAction
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] SSH connection successful!" -ForegroundColor Green
    $autoConnect = $true
} else {
    Write-Host "[X] SSH connection failed" -ForegroundColor Red
    Write-Host "Please ensure the public key is correctly added to K3s server" -ForegroundColor Yellow
    Write-Host "Run: cat ~/.ssh/authorized_keys on K3s server to verify" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Continuing with configuration..." -ForegroundColor Yellow
    $autoConnect = $false
}

Write-Host ""

# 6. Create SSH config file
$configContent = @"
Host k3s-tunnel
    HostName 192.168.109.66
    User root
    IdentityFile C:\Users\$env:USERNAME\.ssh\k3s-tunnel
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    RemoteForward 3765 127.0.0.1:3765
    RemoteForward 8673 127.0.0.1:8673
    RemoteForward 9389 127.0.0.1:9389
    ServerAliveInterval 60
    ServerAliveCountMax 3
"@

$configFile = "$sshDir\config"
Set-Content -Path $configFile -Value $configContent -Encoding ASCII
Write-Host "[OK] SSH config created: $configFile" -ForegroundColor Green

Write-Host ""

# 7. Create start script
$scriptContent = @"
@echo off
echo Starting SSH tunnel to K3s...
echo Press Ctrl+C to stop
echo.
ssh -N k3s-tunnel
pause
"@

$scriptFile = "$env:USERPROFILE\Desktop\start-ssh-tunnel.bat"
Set-Content -Path $scriptFile -Value $scriptContent -Encoding ASCII
Write-Host "[OK] Start script created: $scriptFile" -ForegroundColor Green

Write-Host ""

# 8. Create stop script
$stopScript = @"
@echo off
echo Stopping SSH tunnel...
taskkill /F /IM ssh.exe 2>nul
echo SSH tunnel stopped.
"@

$stopScriptFile = "$env:USERPROFILE\Desktop\stop-ssh-tunnel.bat"
Set-Content -Path $stopScriptFile -Value $stopScript -Encoding ASCII
Write-Host "[OK] Stop script created: $stopScriptFile" -ForegroundColor Green

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Configuration Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "1. Double-click start-ssh-tunnel.bat on desktop to start tunnel" -ForegroundColor White
Write-Host "2. Double-click stop-ssh-tunnel.bat on desktop to stop tunnel" -ForegroundColor White
Write-Host "3. Or run in PowerShell: ssh -N k3s-tunnel" -ForegroundColor White
Write-Host ""
Write-Host "Forwarded Ports:" -ForegroundColor Yellow
Write-Host "  - 3765: Next.js (local)" -ForegroundColor White
Write-Host "  - 8673: Spring Boot (local)" -ForegroundColor White
Write-Host "  - 9389: page2pdf (local)" -ForegroundColor White
Write-Host ""
Write-Host "K3s Access Local Services:" -ForegroundColor Yellow
Write-Host "  - http://127.0.0.1:3765/report" -ForegroundColor White
Write-Host "  - http://127.0.0.1:8673" -ForegroundColor White
Write-Host "  - http://127.0.0.1:9389" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
