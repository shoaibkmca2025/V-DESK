Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

for ($x = 550; $x -le 650; $x += 20) {
    $p = $bmp.GetPixel($x, 300)
    Write-Output ("x=" + $x + ", y=300: R=" + $p.R + ", G=" + $p.G + ", B=" + $p.B)
}
$bmp.Dispose()
