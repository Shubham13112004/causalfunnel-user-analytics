# Start-Dev.ps1
# Quick-start script for the CausalFunnel Analytics development environment
# Run from the project root: .\Start-Dev.ps1

$NodeDir = "D:\nodejs\node-v22.11.0-win-x64"
$env:PATH = "$NodeDir;$env:PATH"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CausalFunnel Analytics — Dev Startup           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Node version: $(node --version)" -ForegroundColor Green
Write-Host "npm  version: $(npm.cmd --version)" -ForegroundColor Green
Write-Host ""
Write-Host "Starting API server (port 5000) and React dashboard (port 5173)..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

npm.cmd run dev
