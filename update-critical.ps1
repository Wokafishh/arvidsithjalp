# Script to automatically inject critical CSS into all HTML files
# Windows PowerShell 5.1+
# Usage: Right-click → Run with PowerShell OR ./update-critical.ps1

$criticalFile = Join-Path $PSScriptRoot "_critical.css"
$htmlFiles = @(
    (Join-Path $PSScriptRoot "index.html"),
    (Join-Path $PSScriptRoot "hem/index.html"),
    (Join-Path $PSScriptRoot "pris/index.html"),
    (Join-Path $PSScriptRoot "om/index.html"),
    (Join-Path $PSScriptRoot "kontakt/index.html"),
    (Join-Path $PSScriptRoot "integritet/index.html")
)

if (-not (Test-Path $criticalFile)) {
    Write-Host "ERROR: _critical.css not found in $(Split-Path $PSScriptRoot -Leaf)" -ForegroundColor Red
    pause
    exit 1
}

$criticalCSS = Get-Content $criticalFile -Raw
$cssIndented = "    " + ($criticalCSS -replace "`n", "`n    ")
$newStyleTag = "    <style>`n$cssIndented`n    </style>"

$updated = 0
$skipped = 0

foreach ($htmlFile in $htmlFiles) {
    if (Test-Path $htmlFile) {
        $content = Get-Content $htmlFile -Raw
        $newContent = $content -replace '(?s)    <style>.*?    </style>', $newStyleTag
        
        if ($newContent -ne $content) {
            Set-Content $htmlFile $newContent -Encoding UTF8 -NoNewline
            Write-Host "✓ $((Get-Item $htmlFile).Name)" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "⊘ $((Get-Item $htmlFile).Name) - No changes" -ForegroundColor Yellow
            $skipped++
        }
    } else {
        Write-Host "✗ $(Split-Path $htmlFile -Leaf) - Not found" -ForegroundColor Red
    }
}

Write-Host "`nDone! Updated: $updated | Skipped: $skipped" -ForegroundColor Cyan
pause
