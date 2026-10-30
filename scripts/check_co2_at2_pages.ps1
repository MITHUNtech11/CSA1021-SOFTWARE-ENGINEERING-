$filePath = (Get-Item "assessment&activity/CO2-AT2/CO2-AT2-Mineral ore minning.docx").FullName
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($filePath, $false, $true)
    $pages = $doc.ComputeStatistics(2) # wdStatisticPages = 2
    Write-Host "TOTAL_PAGES: $pages"
    
    for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
        $p = $doc.Paragraphs.Item($i)
        $t = $p.Range.Text.Trim()
        if ($t -match '^[1-6]\. ' -or $t -match 'CO2 ASSESSMENT TOOL 2' -or $t -match 'Rubrics' -or $t -match 'Annexure') {
            $pageNum = $p.Range.Information(3) # wdActiveEndPageNumber = 3
            Write-Host "Page $pageNum : $t"
        }
    }
    
    # Also save as PDF for final submission package!
    $pdfPath = [System.IO.Path]::ChangeExtension($filePath, ".pdf")
    $doc.SaveAs([ref]$pdfPath, [ref]17) # wdFormatPDF = 17
    Write-Host "PDF generated successfully at: $pdfPath"
    
    $doc.Close($false)
} catch {
    Write-Host "Error: $_"
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
