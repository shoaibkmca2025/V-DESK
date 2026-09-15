Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Count non-white pixels per row to identify horizontal gaps between emblem and text
for ($y = 132; $y -le 684; $y += 6) {
    $nonWhite = 0
    for ($x = 164; $x -le 864; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 230 -or $c.G -lt 230 -or $c.B -lt 230) {
            $nonWhite++
        }
    }
    if ($nonWhite -lt 4) {
        Write-Output "Blank row at Y=$y (count=$nonWhite)"
    }
}
$bmp.Dispose()
