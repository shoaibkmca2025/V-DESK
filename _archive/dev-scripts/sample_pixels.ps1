Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

for ($y = 170; $y -le 310; $y += 30) {
    for ($x = 480; $x -le 540; $x += 20) {
        $p = $bmp.GetPixel($x, $y)
        Write-Output ("x=" + $x + ", y=" + $y + ": R=" + $p.R + ", G=" + $p.G + ", B=" + $p.B)
    }
}
$bmp.Dispose()
