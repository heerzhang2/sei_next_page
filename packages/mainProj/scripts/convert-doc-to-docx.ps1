# Convert .doc template to .docx (bookmarks -> {bookmark_name} placeholders)
# Usage: .\convert-doc-to-docx.ps1 <input.doc> [output.docx]

param(
    [Parameter(Mandatory = $true)]
    [string]$InputDoc,
    [string]$OutputDocx = ""
)

$ErrorActionPreference = "Stop"

if ($OutputDocx -eq "") {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($InputDoc)
    $dir = [System.IO.Path]::GetDirectoryName($InputDoc)
    $OutputDocx = [System.IO.Path]::Combine($dir, "${base}-converted.docx")
}

Write-Host "Input: $InputDoc"
Write-Host "Output: $OutputDocx"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    # Open as ReadOnly to avoid modifying the original
    $doc = $word.Documents.Open([ref]$InputDoc, [ref]$false, [ref]$true)

    # 关闭修订模式，避免替换书签时产生修改标记
    $doc.TrackRevisions = $false

    # 接受所有已有的修订（清除文档中的修改痕迹）
    while ($doc.Revisions.Count -gt 0) {
        $doc.Revisions.Item(1).Accept()
    }

    # Collect all bookmark names and ranges first, then modify
    $bookmarkNames = @()
    for ($i = 1; $i -le $doc.Bookmarks.Count; $i++) {
        $bookmarkNames += $doc.Bookmarks.Item($i).Name
    }

    Write-Host "Found $($bookmarkNames.Count) bookmarks"

    for ($i = 0; $i -lt $bookmarkNames.Count; $i++) {
        $name = $bookmarkNames[$i]
        # Check if bookmark still exists
        if ($doc.Bookmarks.Exists($name)) {
            $bm = $doc.Bookmarks.Item($name)
            $placeholder = "{$name}"
            $range = $bm.Range
            $range.Text = $placeholder
            # Re-add the bookmark (setting Range.Text deletes it)
            $doc.Bookmarks.Add($name, $range) | Out-Null
            Write-Host "  [$($i+1)/$($bookmarkNames.Count)] $name -> $placeholder"
        } else {
            Write-Host "  [$($i+1)/$($bookmarkNames.Count)] $name - skipped (already gone)"
        }
    }

    # Save as new .docx file (16 = wdFormatDocumentDefault)
    $doc.SaveAs2([ref]$OutputDocx, [ref]16)
    $doc.Close()
    Write-Host "Done! Saved to: $OutputDocx"
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    try { $word.Quit() } catch {}
    try { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null } catch {}
    [System.GC]::Collect()
}
