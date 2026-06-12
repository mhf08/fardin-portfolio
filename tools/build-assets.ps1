# Copies and compresses source images from the old site into the new static site.
# Downscales to a max long edge, fixes EXIF orientation, re-encodes JPEG at quality 80.
Add-Type -AssemblyName System.Drawing

$SRC = "D:\Website Content\Portfolio Site\Site-Rebuild\artifacts\personal-website\public"
$OUT = "D:\Website Content\fardin-portfolio\assets"

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Convert-Image {
    param([string]$Source, [string]$Dest, [int]$MaxEdge = 1600, [long]$Quality = 80)

    $destDir = Split-Path $Dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force $destDir | Out-Null }

    $img = [System.Drawing.Image]::FromFile($Source)
    try {
        # Apply EXIF orientation if present
        if ($img.PropertyIdList -contains 274) {
            $o = $img.GetPropertyItem(274).Value[0]
            switch ($o) {
                3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
        }

        $w = $img.Width; $h = $img.Height
        $scale = [Math]::Min(1.0, $MaxEdge / [double][Math]::Max($w, $h))
        $nw = [int]($w * $scale); $nh = [int]($h * $scale)

        $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.Clear([System.Drawing.Color]::White)   # flatten any transparency onto white
        $g.DrawImage($img, 0, 0, $nw, $nh)
        $g.Dispose()

        $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
        $bmp.Save($Dest, $jpegCodec, $ep)
        $bmp.Dispose()

        $kb = [int]((Get-Item $Dest).Length / 1KB)
        Write-Output ("{0}  ->  {1}  ({2}x{3}, {4} KB)" -f (Split-Path $Source -Leaf), (Split-Path $Dest -Leaf), $nw, $nh, $kb)
    }
    finally { $img.Dispose() }
}

$map = @(
    # portrait
    @{ s = "images\portrait.jpg";                                  d = "img\portrait.jpg";              m = 1200 },
    # projects
    @{ s = "images\IoT Poster.png";                                d = "img\projects\iot-poster.jpg";   m = 1600 },
    @{ s = "images\iot-hardware.jfif";                             d = "img\projects\iot-hardware.jpg"; m = 1400 },
    @{ s = "images\hydropedal.jpg";                                d = "img\projects\hydropedal-1.jpg"; m = 1400 },
    @{ s = "images\hydropedal2.jpg";                               d = "img\projects\hydropedal-2.jpg"; m = 1400 },
    @{ s = "images\drilling-isometric.jpg";                        d = "img\projects\drill-iso.jpg";    m = 1600 },
    @{ s = "images\drilling-closeup.jpg";                          d = "img\projects\drill-close.jpg";  m = 1600 },
    # experience
    @{ s = "images\rancon\rancon-7.JPG";                           d = "img\experience\rancon-1.jpg";   m = 1600 },
    @{ s = "images\rancon\rancon-1.jpg";                           d = "img\experience\rancon-2.jpg";   m = 1400 },
    @{ s = "images\rancon\rancon-2.jpg";                           d = "img\experience\rancon-3.jpg";   m = 1400 },
    @{ s = "images\rancon\rancon-3.jpg";                           d = "img\experience\rancon-4.jpg";   m = 1400 },
    @{ s = "images\rancon\rancon-4.jpg";                           d = "img\experience\rancon-5.jpg";   m = 1400 },
    @{ s = "images\rancon\rancon-5.jpg";                           d = "img\experience\rancon-6.jpg";   m = 1400 },
    @{ s = "images\rancon\rancon-6.JPG";                           d = "img\experience\rancon-7.jpg";   m = 1600 },
    @{ s = "images\anwar-visit\anwar-1.jpg";                       d = "img\experience\anwar-1.jpg";    m = 1600 },
    @{ s = "images\anwar-visit\anwar-2.jpg";                       d = "img\experience\anwar-2.jpg";    m = 1600 },
    # recognition
    @{ s = "images\wash-photo-1.jpg";                              d = "img\awards\wash-1.jpg";         m = 1400 },
    @{ s = "images\wash-photo-2.jpg";                              d = "img\awards\wash-2.jpg";         m = 1400 },
    @{ s = "images\wash-photo-3.jpg";                              d = "img\awards\wash-3.jpg";         m = 1400 },
    @{ s = "images\wash-certificate.png";                          d = "img\awards\wash-certificate.jpg";  m = 1600 },
    @{ s = "images\lean-six-sigma-cert.png";                       d = "img\awards\lean-six-sigma.jpg"; m = 1600 },
    @{ s = "images\ms-office-cert.jpg";                            d = "img\awards\ms-office.jpg";      m = 1600 },
    @{ s = "images\cr-recognition.jfif";                           d = "img\awards\cr-recognition.jpg"; m = 1600 },
    # photography: genba series
    @{ s = "images\genba\1649071128648-01.jpg";                    d = "img\photos\genba-01.jpg";       m = 1800 },
    @{ s = "images\genba\1670329146012.jpg";                       d = "img\photos\genba-02.jpg";       m = 1600 },
    @{ s = "images\genba\1671016098360.jpg";                       d = "img\photos\genba-03.jpg";       m = 1600 },
    @{ s = "images\genba\1671120773254.jpg";                       d = "img\photos\genba-04.jpg";       m = 1600 },
    @{ s = "images\genba\1671120773270.jpg";                       d = "img\photos\genba-05.jpg";       m = 1600 },
    @{ s = "images\genba\1671120773287.jpg";                       d = "img\photos\genba-06.jpg";       m = 1600 },
    @{ s = "images\genba\1671120773312.jpg";                       d = "img\photos\genba-07.jpg";       m = 1600 },
    @{ s = "images\genba\PXL_20220315_164108162.jpg";              d = "img\photos\genba-08.jpg";       m = 1600 },
    @{ s = "images\genba\PXL_20250602_160018670 (4).jpg";          d = "img\photos\genba-09.jpg";       m = 1600 },
    @{ s = "images\genba\PXL_20251222_160206575.jpg";              d = "img\photos\genba-10.jpg";       m = 1600 },
    # photography: nature series
    @{ s = "images\nature\Copy of 2008016_Mostofa Habib Fardin_01.jpg"; d = "img\photos\nature-01.jpg"; m = 1800 },
    @{ s = "images\nature\1673166717782.jpg";                      d = "img\photos\nature-02.jpg";      m = 1600 },
    @{ s = "images\nature\1656747767552.jpg";                      d = "img\photos\nature-03.jpg";      m = 1600 },
    @{ s = "images\nature\1673166839760.jpg";                      d = "img\photos\nature-04.jpg";      m = 1600 },
    @{ s = "images\nature\1673166772052.jpg";                      d = "img\photos\nature-05.jpg";      m = 1600 },
    @{ s = "images\nature\Copy of 2008016_Mostofa Habib Fardin_02.jpg"; d = "img\photos\nature-06.jpg"; m = 1600 }
)

foreach ($item in $map) {
    $srcPath = Join-Path $SRC $item.s
    $dstPath = Join-Path $OUT $item.d
    if (Test-Path $srcPath) {
        try { Convert-Image -Source $srcPath -Dest $dstPath -MaxEdge $item.m }
        catch { Write-Output ("FAILED: {0} -- {1}" -f $item.s, $_.Exception.Message) }
    } else {
        Write-Output ("MISSING: {0}" -f $item.s)
    }
}

# Straight copies
Copy-Item (Join-Path $SRC "resume.pdf") (Join-Path $OUT "resume.pdf") -Force
Copy-Item (Join-Path $SRC "opengraph.jpg") (Join-Path $OUT "og.jpg") -Force
Write-Output "Done."
