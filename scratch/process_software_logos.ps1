Add-Type -AssemblyName System.Drawing

$srcDir = 'C:\Users\Admin\.gemini\antigravity\brain\7c3b469f-6625-43e8-872b-5cbc59fd8f76\.user_uploaded'
$destDir = 'C:\Users\Admin\.gemini\antigravity\scratch\das-enterprise\assets\software'

if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

$map = @{
    'media_1789864694526.png' = 'tally_prime.png'
    'media_1789864698576.png' = 'logic_erp.png'
    'media_1789864702845.png' = 'quickbill.png'
    'media_1789864710065.png' = 'antivirus.png'
    'media_1789864714126.png' = 'shoper9.png'
}

foreach ($srcFile in $map.Keys) {
    $srcPath = Join-Path $srcDir $srcFile
    $destPath = Join-Path $destDir $map[$srcFile]

    if (Test-Path $srcPath) {
        $bmp = New-Object System.Drawing.Bitmap($srcPath)
        $transparentColor = [System.Drawing.Color]::FromArgb(0, 255, 255, 255)

        for ($x = 0; $x -lt $bmp.Width; $x++) {
            for ($y = 0; $y -lt $bmp.Height; $y++) {
                $p = $bmp.GetPixel($x, $y)
                # If pixel is white / near-white
                if ($p.R -gt 240 -and $p.G -gt 240 -and $p.B -gt 240) {
                    $bmp.SetPixel($x, $y, $transparentColor)
                }
            }
        }

        $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Write-Host "Processed: $destPath"
    } else {
        Write-Host "File not found: $srcPath"
    }
}
