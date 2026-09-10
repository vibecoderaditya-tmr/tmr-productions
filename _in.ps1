$base = 'F:\graphics and datas\assets\liveGraphics'
$cssContent = Get-Content (Join-Path $base 'css/admin/admin.css') -Raw -Encoding UTF8
$jsContent = Get-Content (Join-Path $base 'js/admin.js') -Raw -Encoding UTF8
$html = Get-Content (Join-Path $base 'admin.html') -Raw -Encoding UTF8
$body = [regex]::Match($html, '(?s)<body[^>]*>(.*?)</body>').Groups[1].Value
$head = [regex]::Replace([regex]::Match($html, '(?s)<head>(.*?)</head>').Groups[1].Value, '(?s)<style[^>]*>.*?</style>', '')
$head = [regex]::Replace($head, '(?s)<script\s+src="[^"]*"[^>]*>\s*</script>', '')
$head = ($head -split "`n" | Where-Object { $_.Trim() -ne '' }) -join "`n"
$out = "<!DOCTYPE html>`n<html lang=`"en`">`n<head>`n$head`n<style>`n$cssContent`n</style>`n</head>`n<body>`n$body`n<script>`n$jsContent`n</script>`n</body>`n</html>"
[System.IO.File]::WriteAllText((Join-Path $base 'ignore\admin.html'), $out, [System.Text.UTF8Encoding]::new($false))
Write-Host "REBUILT"
