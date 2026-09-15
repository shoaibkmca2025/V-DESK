Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# 1. OPTION 1: BRIGHT ENAMEL BADGE (Original crisp emblem on pure white background, tightly cropped & centered)
# Crop bounding box of emblem: X=[230, 800], Y=[120, 470]
$cropX = 230
$cropY = 120
$cropW = 570
$cropH = 350

$enamelBmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($enamelBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$g.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Enhance saturation and brightness of enamel logo:
# Make gold brighter (#F59E0B / #FBBF24) and navy into vibrant royal blue (#1E40AF / #2563EB)
for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $p = $enamelBmp.GetPixel($x, $y)
        $r = $p.R; $g = $p.G; $b = $p.B
        $distWhite = [Math]::Sqrt(([Math]::Pow(255 - $r, 2) + [Math]::Pow(255 - $g, 2) + [Math]::Pow(255 - $b, 2)) / 3.0)
        
        if ($distWhite -gt 20) {
            $isGold = ($r -gt 120 -and $g -gt 80 -and $r -gt ($b + 35))
            if ($isGold) {
                # Bright, vivid warm gold: R=245, G=170, B=40 (#F5AA28)
                $factor = [Math]::Min(1.0, $distWhite / 60.0)
                $nr = [int](255 * (1 - $factor) + 245 * $factor)
                $ng = [int](255 * (1 - $factor) + 165 * $factor)
                $nb = [int](255 * (1 - $factor) + 35 * $factor)
                $enamelBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $nr, $ng, $nb))
            } else {
                # Make the dark navy into vibrant, bright royal navy: R=15, G=45, B=120 (#0F2D78)
                $factor = [Math]::Min(1.0, $distWhite / 80.0)
                $nr = [int](255 * (1 - $factor) + 15 * $factor)
                $ng = [int](255 * (1 - $factor) + 48 * $factor)
                $nb = [int](255 * (1 - $factor) + 115 * $factor)
                $enamelBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $nr, $ng, $nb))
            }
        }
    }
}

$enamelPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-emblem-bright-white.png"
$enamelBmp.Save($enamelPath, [System.Drawing.Imaging.ImageFormat]::Png)

# 2. OPTION 2: BRIGHT VIBRANT TRANSPARENT LOGO (Bright Electric Royal Blue #2563EB + Radiant Gold #FBBF24)
$brightTrans = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $p = $srcBmp.GetPixel($cropX + $x, $cropY + $y)
        $r = $p.R; $g = $p.G; $b = $p.B
        $distWhite = [Math]::Sqrt(([Math]::Pow(255 - $r, 2) + [Math]::Pow(255 - $g, 2) + [Math]::Pow(255 - $b, 2)) / 3.0)
        
        if ($distWhite -lt 18) {
            $brightTrans.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $alpha = [int]([Math]::Min(255, $distWhite * 6.5))
            $isGold = ($r -gt 120 -and $g -gt 80 -and $r -gt ($b + 35))
            if ($isGold) {
                # Radiant Bright Gold (#FFC107 / #FBBF24)
                $brightTrans.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 193, 7))
            } else {
                # Bright Vivid Royal Blue / Cyan Glow (#38BDF8 / #2563EB / #60A5FA)
                # Gives high-energy, modern executive tech brilliance!
                $brightTrans.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 56, 189, 248))
            }
        }
    }
}

$brightTransPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-emblem-vivid-blue-gold.png"
$brightTrans.Save($brightTransPath, [System.Drawing.Imaging.ImageFormat]::Png)

# 3. OPTION 3: BRIGHT PURE GOLD & WHITE (Luminous Polished Gold #FFD700 + Pure White #FFFFFF)
$brightGold = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $p = $srcBmp.GetPixel($cropX + $x, $cropY + $y)
        $r = $p.R; $g = $p.G; $b = $p.B
        $distWhite = [Math]::Sqrt(([Math]::Pow(255 - $r, 2) + [Math]::Pow(255 - $g, 2) + [Math]::Pow(255 - $b, 2)) / 3.0)
        
        if ($distWhite -lt 18) {
            $brightGold.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $alpha = [int]([Math]::Min(255, $distWhite * 6.5))
            $isGold = ($r -gt 120 -and $g -gt 80 -and $r -gt ($b + 35))
            if ($isGold) {
                # Bright Polished 24K Gold (#FFD700: 255, 215, 0)
                $brightGold.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 215, 0))
            } else {
                # Luminous Bright White (#FFFFFF)
                $brightGold.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            }
        }
    }
}

$brightGoldPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-emblem-bright-gold.png"
$brightGold.Save($brightGoldPath, [System.Drawing.Imaging.ImageFormat]::Png)

$enamelBmp.Dispose()
$brightTrans.Dispose()
$brightGold.Dispose()
$srcBmp.Dispose()

Write-Output "Successfully created 3 bright logo variations!"
