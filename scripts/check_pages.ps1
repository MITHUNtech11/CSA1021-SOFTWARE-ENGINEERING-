$filePath = (Get-Item "assessment&activity/CO2-AT1/CO2-AT1-Mineral ore minning.docx").FullName
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($filePath, $false, $true)
    $pages = $doc.ComputeStatistics(2)
    Write-Host "EXACT_PAGES: $pages"
    $doc.Close($false)
} catch {
    Write-Host "Error: $_"
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
