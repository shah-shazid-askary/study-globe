param(
  [string]$OutputDir = (Join-Path $PSScriptRoot '..\test-fixtures')
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$pdfPath = Join-Path $OutputDir 'sample-sop.pdf'
$docxPath = Join-Path $OutputDir 'sample-sop.docx'

$objects = @()
$objects += "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`n"
$objects += "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`n"
$objects += "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj`n"
$stream = 'BT /F1 18 Tf 50 100 Td (Sample PDF SOP text) Tj ET'
$objects += "4 0 obj << /Length $($stream.Length) >> stream`n$stream`nendstream endobj`n"
$objects += "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`n"

$bytes = [System.Collections.Generic.List[byte]]::new()
function Add-AsciiBytes {
  param([string]$Text)
  $bytes.AddRange([System.Text.Encoding]::ASCII.GetBytes($Text))
}

Add-AsciiBytes "%PDF-1.4`n"
$offsets = @(0)
foreach ($obj in $objects) {
  $offsets += $bytes.Count
  Add-AsciiBytes $obj
}

$xrefStart = $bytes.Count
Add-AsciiBytes "xref`n0 6`n"
Add-AsciiBytes "0000000000 65535 f `n"
for ($i = 1; $i -le 5; $i++) {
  Add-AsciiBytes (("{0:0000000000} 00000 n `n" -f $offsets[$i]))
}
Add-AsciiBytes "trailer << /Root 1 0 R /Size 6 >>`nstartxref`n"
Add-AsciiBytes ($xrefStart.ToString() + "`n%%EOF")
[System.IO.File]::WriteAllBytes($pdfPath, $bytes.ToArray())

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" />
</Types>
'@

$rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml" />
</Relationships>
'@

$doc = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Sample DOCX SOP text</w:t></w:r></w:p>
  </w:body>
</w:document>
'@

$tempDir = Join-Path $OutputDir '_docx-temp'
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path (Join-Path $tempDir '_rels') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tempDir 'word') | Out-Null

Set-Content -Path (Join-Path $tempDir '[Content_Types].xml') -Value $contentTypes -Encoding UTF8
Set-Content -Path (Join-Path $tempDir '_rels/.rels') -Value $rels -Encoding UTF8
Set-Content -Path (Join-Path $tempDir 'word/document.xml') -Value $doc -Encoding UTF8

Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $docxPath -Force
Remove-Item -Recurse -Force $tempDir

Write-Output $pdfPath
Write-Output $docxPath