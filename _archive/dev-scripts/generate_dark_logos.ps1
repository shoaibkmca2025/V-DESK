Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$destDir1 = "C:\Users\ASUS\Desktop\V-DESK-Workspace\assets"
$destDir2 = "C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace\assets"

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $srcBmp.Width
$height = $srcBmp.Height

# Bounding box of content: X=[160, 868], Y=[128, 688]
# Emblem only bounding box: X=[240, 788], Y=[130, 465]

Write-Output "Processing dark-mode transparent logos..."

# Function to process bitmap with transparency and color adaptation for dark theme
function Process-DarkLogo([System.Drawing.Bitmap]$source, [int]$cropX, [int]$cropY, [int]$cropW, [int]$cropH) {
    $outBmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $cropH; $y++) {
        for ($x = 0; $x -lt $cropW; $x++) {
            $srcX = $cropX + $x
            $srcY = $cropY + $y
            if ($srcX -ge $source.Width -or $srcY -ge $source.Height) { continue }
            
            $pixel = $source.GetPixel($srcX, $srcY)
            $r = $pixel.R
            $g = $pixel.G
            $b = $pixel.B
            
            # White / Near-White background detection
            # Luminance check
            $lum = (0.299 * $r) + (0.587 * $g) + (0.114 * $b)
            
            if ($r -gt 225 -and $g -gt 225 -and $b -gt 225) {
                # Completely transparent background
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
            elseif ($lum -gt 210) {
                # Smooth anti-aliased edge fading to transparency
                $alpha = [int]([Math]::Max(0, (255 - $lum) * 2.5))
                if ($alpha -gt 255) { $alpha = 255 }
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 197, 146, 57))
            }
            else {
                # Determine if pixel is gold or navy
                # Gold has R > 150, G > 100, B < 80 (warm yellow/brown/gold)
                if ($r -gt 130 -and $g -gt 85 -and $b -lt 90) {
                    # Gold element: Enhance to website's signature metallic gold (#C59239 / #D4A348)
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 212, 163, 72))
                }
                # Navy/Dark element: In the original, it is dark navy #0b1a3d which vanishes on dark backgrounds.
                # On the dark luxury website, transform this to crisp, luminous Executive Platinum/White (#FFFFFF)
                # with subtle champagne shading so the emblem radiates with absolute clarity and luxury.
                else {
                    # Calculate intensity/anti-aliasing
                    $whiteness = [int](255 - ($lum * 0.2))
                    if ($whiteness -gt 255) { $whiteness = 255 }
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
                }
            }
        }
    }
    return $outBmp
}

# 1. Generate Emblem Only (cropped to the symbol, perfect for navbar emblem icon)
$emblemX = 240
$emblemY = 130
$emblemW = 550
$emblemH = 340

$emblemBmp = Process-DarkLogo $srcBmp $emblemX $emblemY $emblemW $emblemH

# 2. Generate Full Logo (emblem + text)
$fullX = 160
$fullY = 128
$fullW = 710
$fullH = 560

$fullBmp = Process-DarkLogo $srcBmp $fullX $fullY $fullW $fullH

# Save outputs to both Desktop and Scratch directories
foreach ($dir in @($destDir1, $destDir2)) {
    if (Test-Path $dir) {
        $emblemPath = Join-Path $dir "vdesk-emblem-dark.png"
        $fullPath = Join-Path $dir "vdesk-logo-dark.png"
        
        $emblemBmp.Save($emblemPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $fullBmp.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Saved dark-theme logos to $dir"
    }
}

$emblemBmp.Dispose()
$fullBmp.Dispose()
$srcBmp.Dispose()
Write-Output "Done generating dark-mode transparent logos!"
