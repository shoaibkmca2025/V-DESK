Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$destDir1 = "C:\Users\ASUS\Desktop\V-DESK-Workspace\assets"
$destDir2 = "C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace\assets"

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

function Make-RefinedLogo([System.Drawing.Bitmap]$source, [int]$cropX, [int]$cropY, [int]$cropW, [int]$cropH, [string]$theme) {
    $outBmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $cropH; $y++) {
        for ($x = 0; $x -lt $cropW; $x++) {
            $srcX = $cropX + $x
            $srcY = $cropY + $y
            if ($srcX -ge $source.Width -or $srcY -ge $source.Height) { continue }
            
            $p = $source.GetPixel($srcX, $srcY)
            $r = $p.R
            $g = $p.G
            $b = $p.B
            
            # Distance from white (255, 255, 255)
            $distFromWhite = [Math]::Sqrt(([Math]::Pow(255 - $r, 2) + [Math]::Pow(255 - $g, 2) + [Math]::Pow(255 - $b, 2)) / 3.0)
            
            if ($distFromWhite -lt 15) {
                # Pure white -> transparent
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
            else {
                # Calculate opacity for smooth anti-aliased edge
                $alpha = [int]([Math]::Min(255, $distFromWhite * 6.0))
                
                # Check if gold pixel
                # Gold characteristic: Red is high, Green is medium-high, Blue is lower
                $isGold = ($r -gt 130 -and $g -gt 90 -and $r -gt ($b + 40))
                
                if ($isGold) {
                    # Signature Metallic Warm Gold (#C59239 -> R=197, G=146, B=57, or #D4A348 -> R=212, G=163, B=72)
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 212, 163, 72))
                }
                else {
                    # Dark navy in original -> map to crisp luminous White (#FFFFFF) with champagne warmth
                    # on dark theme, white gives maximum executive luxury clarity
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
                }
            }
        }
    }
    return $outBmp
}

# Generate 1: Emblem Only
$emblemCropX = 230
$emblemCropY = 120
$emblemCropW = 570
$emblemCropH = 350
$refinedEmblem = Make-RefinedLogo $srcBmp $emblemCropX $emblemCropY $emblemCropW $emblemCropH "dark"

# Generate 2: Full Logo (Emblem + Text)
$fullCropX = 150
$fullCropY = 120
$fullCropW = 730
$fullCropH = 580
$refinedFull = Make-RefinedLogo $srcBmp $fullCropX $fullCropY $fullCropW $fullCropH "dark"

# Save to assets
foreach ($dir in @($destDir1, $destDir2)) {
    if (Test-Path $dir) {
        $eFile = Join-Path $dir "vdesk-emblem-dark.png"
        $fFile = Join-Path $dir "vdesk-logo-dark.png"
        $refinedEmblem.Save($eFile, [System.Drawing.Imaging.ImageFormat]::Png)
        $refinedFull.Save($fFile, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Saved to $dir"
    }
}

# Also copy to brain artifacts for inspection
$brainDir = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166"
$refinedEmblem.Save((Join-Path $brainDir "vdesk-emblem-dark.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$refinedFull.Save((Join-Path $brainDir "vdesk-logo-dark.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$refinedEmblem.Dispose()
$refinedFull.Dispose()
$srcBmp.Dispose()
Write-Output "Refined dark logos saved successfully!"
