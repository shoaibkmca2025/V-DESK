Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ASUS\.gemini\antigravity-ide\brain\9f56b36b-10f3-4eaa-8be8-90b262dc9166\vdesk-logo.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output "Image size: $($bmp.Width)x$($bmp.Height)"

# Sample several points:
# Center of image is around x=512, y=411
# Let's find bounding box of non-white pixels
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y += 4) {
    for ($x = 0; $x -lt $bmp.Width; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        # Check if not white (white is R>235, G>235, B>235)
        if ($c.R -lt 230 -or $c.G -lt 230 -or $c.B -lt 230) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Content bounding box: X=[$minX, $maxX], Y=[$minY, $maxY]"
$bmp.Dispose()
