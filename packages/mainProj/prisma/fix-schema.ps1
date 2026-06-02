# PowerShell 脚本用于 Windows
# 自动修复 schema.prisma 中的 id 字段

$schemaFile = "prisma/schema.prisma"

if (-not (Test-Path $schemaFile)) {
    Write-Error "schema.prisma not found!"
    exit 1
}

# 备份
$backupName = "${schemaFile}.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $schemaFile $backupName
Write-Host "Backup created: $backupName"

# 读取内容
$content = Get-Content $schemaFile -Raw

# 正则替换：为 id BigInt @id 添加 @default(autoincrement())
# 使用 .NET 正则的负向前瞻
$regex = [regex]'(?m)^(\s*id\s+BigInt\s+@id)(?!.*@default\(autoincrement\(\)\))'
$content = $regex.Replace($content, '$1 @default(autoincrement())')

# 写回
Set-Content $schemaFile $content -NoNewline

Write-Host "Schema fixed! Added @default(autoincrement()) to all id fields."
