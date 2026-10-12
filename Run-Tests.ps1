# Run-Tests.ps1
# Run all tests for the CausalFunnel Analytics application
# Run from the project root: .\Run-Tests.ps1

$NodeDir = "D:\nodejs\node-v22.11.0-win-x64"
$env:PATH = "$NodeDir;$env:PATH"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CausalFunnel Analytics — Test Runner           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "━━━ Backend Tests (Jest + Supertest) ━━━" -ForegroundColor Yellow
Write-Host "Note: mongodb-memory-server downloads its binary on first run (~200MB)" -ForegroundColor Gray
Write-Host ""
npm.cmd run test --prefix server
$backendExit = $LASTEXITCODE

Write-Host ""
Write-Host "━━━ Frontend Tests (Vitest) ━━━" -ForegroundColor Yellow
Write-Host ""
npm.cmd run test --prefix client
$frontendExit = $LASTEXITCODE

Write-Host ""
if ($backendExit -eq 0 -and $frontendExit -eq 0) {
  Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
  Write-Host "❌ Some tests failed. See output above." -ForegroundColor Red
}
