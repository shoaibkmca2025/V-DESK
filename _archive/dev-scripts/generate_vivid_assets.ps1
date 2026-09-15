Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$destDir1 = "C:\Users\ASUS\Desktop\V-DESK-Workspace\assets"
$destDir2 = "C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace\assets"

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

function Make-VividLogo([System.Drawing.Bitmap]$source, [int]$cropX, [int]$cropY, [int]$cropW, [int]$cropH) {
    $outBmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $cropH; $y++) {
        for ($x = 0; $x -lt $cropW; $x++) {
            $srcX = $cropX + $x
            $srcY = $cropY + $y
            if ($srcX -ge $source.Width -or $srcY -ge $source.Height) { continue }
            
            $p = $source.GetPixel($srcX, $srcY)
            $r = $p.R; $g = $p.G; $b = $p.B
            $distWhite = [Math]::Sqrt(([Math]::Pow(255 - $r, 2) + [Math]::Pow(255 - $g, 2) + [Math]::Pow(255 - $b, 2)) / 3.0)
            
            if ($distWhite -lt 16) {
                # Transparent
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
            else {
                $alpha = [int]([Math]::Min(255, $distWhite * 6.5))
                $isGold = ($r -gt 120 -and $g -gt 80 -and $r -gt ($b + 35))
                
                if ($isGold) {
                    # Bright Radiant Polished Gold (#FFB800 -> 255, 184, 0)
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 188, 10))
                }
                else {
                    # Bright Electric Royal Blue (#2563EB to #38BDF8 -> 56, 189, 248)
                    # Vibrant and ultra-clear against dark backgrounds!
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 56, 189, 248))
                }
            }
        }
    }
    return $outBmp
}

# 1. Emblem Only
$emblemCropX = 230; $emblemCropY = 120; $emblemCropW = 570; $emblemCropH = 350
$vividEmblem = Make-VividLogo $srcBmp $emblemCropX $emblemCropY $emblemCropW $emblemCropH

# 2. Full Logo (Emblem + Text)
$fullCropX = 150; $fullCropY = 120; $fullCropW = 730; $fullCropH = 580
$vividFull = Make-VividLogo $srcBmp $fullCropX $fullCropY $fullCropW $fullCropH

# Also create White Enamel Badge option with bright vivid borders
$badgeCropX = 230; $badgeCropY = 120; $badgeCropW = 570; $badgeCropH = 350
$badgeBmp = New-Object System.Drawing.Bitmap($badgeCropW, $badgeCropH)
$bg = [System.Drawing.Graphics]::FromImage($badgeBmp)
$bg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$bg.DrawImage($srcBmp, (New-Object System.Drawing.Rectangle(0, 0, $badgeCropW, $badgeCropH)), (New-Object System.Drawing.Rectangle($badgeCropX, $badgeCropY, $badgeCropW, $badgeCropH)), [System.Drawing.GraphicsUnit]::Pixel)
$bg.Dispose()

foreach ($dir in @($destDir1, $destDir2)) {
    if (Test-Path $dir) {
        $vividEmblem.Save((Join-Path $dir "vdesk-emblem-vivid.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $vividFull.Save((Join-Path $dir "vdesk-logo-vivid.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $badgeBmp.Save((Join-Path $dir "vdesk-emblem-white-badge.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        # Also overwrite the active emblem with the vivid one
        $vividEmblem.Save((Join-Path $dir "vdesk-emblem-dark.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $vividFull.Save((Join-Path $dir "vdesk-logo-dark.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Saved bright vivid logos to $dir"
    }
}

$vividEmblem.Dispose()
$vividFull.Dispose()
$badgeBmp.Dispose()
$srcBmp.Dispose()
Write-Output "All bright vivid logo assets generated!"
