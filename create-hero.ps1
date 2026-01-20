# Create hero.png and og-image.png from icon.png
# Hero format: 1200x630px (1.91:1 ratio)

$iconPath = "public\icon.png"

if (-not (Test-Path $iconPath)) {
    Write-Host "Error: File not found: $iconPath" -ForegroundColor Red
    exit 1
}

Write-Host "Creating hero.png and og-image.png..." -ForegroundColor Green

Add-Type -AssemblyName System.Drawing

try {
    $icon = [System.Drawing.Image]::FromFile((Resolve-Path $iconPath))
    
    $heroWidth = 1200
    $heroHeight = 630
    
    $publicPath = (Resolve-Path "public").Path
    
    # Create hero.png
    $hero = New-Object System.Drawing.Bitmap($heroWidth, $heroHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($hero)
    
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $darkBlue = [System.Drawing.Color]::FromArgb(0, 0, 17)
    $graphics.FillRectangle((New-Object System.Drawing.SolidBrush($darkBlue)), 0, 0, $heroWidth, $heroHeight)
    
    $iconSize = [Math]::Min($heroWidth, $heroHeight) * 0.5
    $x = ($heroWidth - $iconSize) / 2
    $y = ($heroHeight - $iconSize) / 2
    
    $graphics.DrawImage($icon, [float]$x, [float]$y, [float]$iconSize, [float]$iconSize)
    
    $heroPath = $publicPath + "\hero.png"
    $hero.Save($heroPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Copy hero to og-image (same format)
    $ogPath = $publicPath + "\og-image.png"
    $hero.Save($ogPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $hero.Dispose()
    $icon.Dispose()
    
    Write-Host "Success: hero.png and og-image.png created" -ForegroundColor Green
    Write-Host "Size: ${heroWidth}x${heroHeight}px" -ForegroundColor Gray
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
