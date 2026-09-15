Add-Type -AssemblyName System.Drawing

$p = "C:\Users\ASUS\Desktop\V-DESK-Workspace\assets\vdesk-navbar-logo.png"
$bmp = [System.Drawing.Bitmap]::FromFile($p)

$c0 = $bmp.GetPixel(0, 0)
$cCenter = $bmp.GetPixel(512, 218)
Write-Output ("Corner pixel: A=" + $c0.A + " R=" + $c0.R + " G=" + $c0.G + " B=" + $c0.B)
Write-Output ("Center pixel: A=" + $cCenter.A + " R=" + $cCenter.R + " G=" + $cCenter.G + " B=" + $cCenter.B)
$bmp.Dispose()
