Add-Type -AssemblyName System.Drawing

$logoPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo-dark.png"
$logo = [System.Drawing.Bitmap]::FromFile($logoPath)

$w = [int]$logo.Width + 60
$h = [int]$logo.Height + 60
$testBmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($testBmp)
$navColor = [System.Drawing.Color]::FromArgb(255, 6, 21, 47) # #06152F
$g.Clear($navColor)

$g.DrawImage($logo, 30, 30)

$outPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\test-full-on-dark-navy.png"
$testBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$testBmp.Dispose()
$logo.Dispose()
Write-Output "Successfully saved test-full-on-dark-navy.png!"
