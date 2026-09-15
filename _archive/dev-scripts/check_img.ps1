Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output "Image dimension: $($bmp.Width) x $($bmp.Height)"
$bmp.Dispose()
