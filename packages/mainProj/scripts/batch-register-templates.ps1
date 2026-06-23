# Batch: enumerate all OA templates, download, convert to .docx, register in template-map.ts
# Usage: .\batch-register-templates.ps1 <jsessionId>
#
# Example:
#   .\batch-register-templates.ps1 DA26D771FD344589372C51C4431F21BE
#
# Note: requires 'yarn dev' running (calls scan-templates & draft APIs)

param(
    [Parameter(Mandatory = $true)]
    [string]$JsessionId
)

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")
$mapFile = Join-Path $projectRoot "src\app\api\oa-proxy\_templates\template-map.ts"
$targetDir = Join-Path $projectRoot "public\templates\docx"
if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }

# SSL bypass
if (-not ("TrustAllCertsPolicy" -as [type])) {
    Add-Type -TypeDefinition @"
    using System.Net; using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(ServicePoint s, X509Certificate c, WebRequest r, int e) { return true; }
    }
"@
}
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$apiBase = "https://192.168.171.3:9443/report/api/oa-proxy"

# ===== Step 1: 调用 scan-templates API 获取所有模板列表 =====
Write-Host "===== Step 1: Scan all templates via API =====" -ForegroundColor Cyan
try {
    $scanBody = @{ jsessionId = $JsessionId } | ConvertTo-Json
    $scanRes = Invoke-RestMethod -Uri "$apiBase/scan-templates" -Method Post -Body $scanBody -ContentType "application/json"
    if (-not $scanRes.success) { throw $scanRes.error }
    $allTemplates = $scanRes.data.allTemplates
    Write-Host "Found $($scanRes.data.total) unique templates across $($scanRes.data.agencies.Count) agencies"
    foreach ($ag in $scanRes.data.agencies) {
        $count = @($scanRes.data.templates."$($ag.id)").Count
        Write-Host "  $($ag.name) ($($ag.id)): $count templates" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: scan-templates API failed: $_" -ForegroundColor Red
    Write-Host "Make sure 'yarn dev' is running" -ForegroundColor Red
    exit 1
}

# ===== Step 2: Download, convert & register each template =====
Write-Host "`n===== Step 2: Download, convert & register each template =====" -ForegroundColor Cyan
$registered = @()
$count = 0
$total = $allTemplates.Count

foreach ($t in $allTemplates) {
    $count++
    $fuid = $t.fileUnid
    $tname = $t.name
    Write-Host "[$count/$total] Processing template: $fuid" -ForegroundColor Yellow

    # 调用 draft API 下载
    $draftBody = @{ step = "start"; unid = "20260611084142XX699307D7E60F416D"; jsessionId = $JsessionId; fileUnid = $fuid; docFileType = "doc_fw" } | ConvertTo-Json
    try {
        $draftRes = Invoke-RestMethod -Uri "$apiBase/draft" -Method Post -Body $draftBody -ContentType "application/json"
        if (-not $draftRes.success -or -not $draftRes.data.templateBase64) {
            Write-Host "  SKIP: no template returned" -ForegroundColor DarkYellow
            continue
        }
    } catch {
        Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor DarkYellow
        continue
    }

    $docBytes = [System.Convert]::FromBase64String($draftRes.data.templateBase64)
    $tempDir = [System.IO.Path]::GetTempPath()
    $docPath = [System.IO.Path]::Combine($tempDir, "$fuid.doc")
    [System.IO.File]::WriteAllBytes($docPath, $docBytes)

    # Convert to docx
    $convertScript = Join-Path $scriptDir "convert-doc-to-docx.ps1"
    & $convertScript $docPath
    $docxPath = $docPath -replace '\.doc$', '-converted.docx'
    if (-not (Test-Path $docxPath)) {
        Write-Host "  FAIL: conversion error" -ForegroundColor DarkYellow
        continue
    }

    $targetFileBase = "template-$fuid"
    $targetDocx = Join-Path $targetDir "$targetFileBase.docx"
    Copy-Item $docxPath $targetDocx -Force
    $registered += @{ fileUnid = $fuid; name = $tname; fileBase = $targetFileBase }
    Write-Host "  OK: registered as $targetFileBase.docx" -ForegroundColor Green
}

# ===== Step 3: Generate complete template-map.ts =====
Write-Host "`n===== Step 3: Generate template-map.ts =====" -ForegroundColor Cyan

$allLines = @'
/**
 * Pre-converted .docx template map - auto generated
 *
 * key:   OA template fileUnid
 * value: .docx filename under public/templates/docx/
 */

import * as path from 'path';

let _templateDir = '';

export function getTemplateDir(): string {
  if (!_templateDir) {
    _templateDir = path.join(process.cwd(), 'public/templates/docx');
  }
  return _templateDir;
}

export const TEMPLATE_MAP: Record<string, string> = {
'@

$mapEntries = New-Object System.Text.StringBuilder
foreach ($r in $registered) {
    $null = $mapEntries.AppendLine("  '$($r.fileUnid)': '$($r.fileBase).docx',")
}

$endLines = @'
};

export function resolveTemplatePath(fileUnid: string): string | null {
  const fileName = TEMPLATE_MAP[fileUnid];
  if (!fileName) return null;
  return path.join(getTemplateDir(), fileName);
}
'@

$mapContent = $allLines + "`r`n" + $mapEntries.ToString().TrimEnd() + "`r`n" + $endLines
[System.IO.File]::WriteAllText($mapFile, $mapContent, [System.Text.Encoding]::UTF8)

Write-Host "`n===== DONE =====" -ForegroundColor Green
Write-Host "Templates processed: $($registered.Count)/$total"
Write-Host "template-map.ts updated: $mapFile"
