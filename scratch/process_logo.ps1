Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\Admin\.gemini\antigravity\brain\7c3b469f-6625-43e8-872b-5cbc59fd8f76\.user_uploaded\media_1789864104017.png'
$destDir = 'C:\Users\Admin\.gemini\antigravity\scratch\das-enterprise\assets'
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
$destPath = Join-Path $destDir 'logo.png'

$bmp = New-Object System.Drawing.Bitmap($srcPath)
$transparentColor = [System.Drawing.Color]::FromArgb(0, 255, 255, 255) # Transparent

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 230 -and $p.G -gt 230 -and $p.B -gt 230) {
            $bmp.SetPixel($x, $y, $transparentColor)
        }
    }
}

$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Transparent logo generated at: $destPath"
