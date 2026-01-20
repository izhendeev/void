# Create embed-image.png from icon.png
# Embed format: square 1200x1200px

$iconPath = "public\icon.png"

if (-not (Test-Path $iconPath)) {
    Write-Host "Error: File not found: $iconPath" -ForegroundColor Red
    exit 1
}

Write-Host "Creating embed-image.png..." -ForegroundColor Green

Add-Type -AssemblyName System.Drawing

try {
    $icon = [System.Drawing.Image]::FromFile((Resolve-Path $iconPath))
    
    $embedWidth = 1200
    $embedHeight = 1200
    
    $embed = New-Object System.Drawing.Bitmap($embedWidth, $embedHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($embed)
    
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $darkBlue = [System.Drawing.Color]::FromArgb(0, 0, 17)
    $graphics.FillRectangle((New-Object System.Drawing.SolidBrush($darkBlue)), 0, 0, $embedWidth, $embedHeight)
    
    $iconSize = $embedWidth * 0.6
    $x = ($embedWidth - $iconSize) / 2
    $y = ($embedHeight - $iconSize) / 2
    
    $graphics.DrawImage($icon, [float]$x, [float]$y, [float]$iconSize, [float]$iconSize)
    
    $publicPath = (Resolve-Path "public").Path
    $embedPath = $publicPath + "\embed-image.png"
    $embed.Save($embedPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $embed.Dispose()
    $icon.Dispose()
    
    Write-Host "Success: embed-image.png created" -ForegroundColor Green
    Write-Host "Size: ${embedWidth}x${embedHeight}px" -ForegroundColor Gray
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
