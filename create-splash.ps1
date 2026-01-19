# Create splash.png from icon.png
# Uses .NET System.Drawing

$iconPath = "public\icon.png"
$splashPath = "public\splash.png"

if (-not (Test-Path $iconPath)) {
    Write-Host "Error: File not found: $iconPath" -ForegroundColor Red
    exit 1
}

Write-Host "Creating splash.png from icon.png..." -ForegroundColor Green

Add-Type -AssemblyName System.Drawing

try {
    $icon = [System.Drawing.Image]::FromFile((Resolve-Path $iconPath))
    
    $splashWidth = 1200
    $splashHeight = 1200
    
    $splash = New-Object System.Drawing.Bitmap($splashWidth, $splashHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($splash)
    
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $darkBlue = [System.Drawing.Color]::FromArgb(0, 0, 17)
    $graphics.FillRectangle((New-Object System.Drawing.SolidBrush($darkBlue)), 0, 0, $splashWidth, $splashHeight)
    
    $iconSize = [Math]::Min($splashWidth, $splashHeight) * 0.4
    $x = ($splashWidth - $iconSize) / 2
    $y = ($splashHeight - $iconSize) / 2
    
    $graphics.DrawImage($icon, [float]$x, [float]$y, [float]$iconSize, [float]$iconSize)
    
    $outputPath = (Resolve-Path "public").Path + "\splash.png"
    $splash.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $splash.Dispose()
    $icon.Dispose()
    
    Write-Host "Success: splash.png created in public/" -ForegroundColor Green
    Write-Host "Size: ${splashWidth}x${splashHeight}px" -ForegroundColor Gray
    
} catch {
    Write-Host "Error creating splash.png: $_" -ForegroundColor Red
    exit 1
}
