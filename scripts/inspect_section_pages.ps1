$filePath = (Get-Item "assessment&activity/CO2-AT1/CO2-AT1-Mineral ore minning.docx").FullName
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($filePath, $false, $true)
    for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
        $p = $doc.Paragraphs.Item($i)
        $t = $p.Range.Text.Trim()
        if ($t -match '^[0-9]\. ' -or $t -match 'CO2 ASSESSMENT TOOL 1' -or $t -match 'Rubrics') {
            $pageNum = $p.Range.Information(3) # wdActiveEndPageNumber = 3
            Write-Host "Page $pageNum : $t"
        }
    }
    $doc.Close($false)
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
