$content = Get-Content 'c:\Users\Usuario\Downloads\avika.timer\js\modules\storage.js' -Raw
$content = $content -replace 'Avika\.utils\.formatTime\\', 'Avika.utils.formatTime'
$content | Set-Content 'c:\Users\Usuario\Downloads\avika.timer\js\modules\storage.js'
Write-Host "Correcciones aplicadas con éxito"
