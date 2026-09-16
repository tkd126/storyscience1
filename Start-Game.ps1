# Run again after reboot; no installation, no public network listener.
$gameRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$gamePort = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if (-not $gamePort) {
    $gameNode = Get-Command node -ErrorAction SilentlyContinue
    if (-not $gameNode) {
        Start-Process -FilePath (Join-Path $gameRoot 'prototype\index.html')
        exit
    }
    $gameServer = Join-Path $gameRoot 'prototype\serve.cjs'
    Start-Process -FilePath $gameNode.Source -ArgumentList @('"' + $gameServer + '"') -WorkingDirectory $gameRoot -WindowStyle Hidden
    for ($gameAttempt = 0; $gameAttempt -lt 30; $gameAttempt++) {
        try { $gameResponse = Invoke-WebRequest 'http://127.0.0.1:4173/' -UseBasicParsing -TimeoutSec 1; break } catch { Start-Sleep -Milliseconds 100 }
    }
}
Start-Process 'http://127.0.0.1:4173/?v=teacher-review-7'
