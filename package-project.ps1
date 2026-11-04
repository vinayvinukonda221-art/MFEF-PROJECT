$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$root = "c:\MFEF PROJECT"
$staging = "$root\staging_final_build"
$zipOut = "$root\EduPulse_SMS_FINAL.zip"

if (Test-Path $staging) {
    Remove-Item -Recurse -Force $staging
}
New-Item -ItemType Directory -Path $staging | Out-Null

# Copy root documentation, database, and markdown guides
Copy-Item "$root\database" "$staging\database" -Recurse
if (Test-Path "$root\documentation") {
    Copy-Item "$root\documentation" "$staging\documentation" -Recurse
}
Copy-Item "$root\README.md" "$staging\README.md"
Copy-Item "$root\FINAL_SECURITY_REPORT.md" "$staging\FINAL_SECURITY_REPORT.md"
Copy-Item "$root\FINAL_TEST_REPORT.md" "$staging\FINAL_TEST_REPORT.md"
Copy-Item "$root\DEPLOYMENT_GUIDE.md" "$staging\DEPLOYMENT_GUIDE.md"
Copy-Item "$root\SETUP_GUIDE.md" "$staging\SETUP_GUIDE.md"
Copy-Item "$root\.gitignore" "$staging\.gitignore"

# Copy backend excluding node_modules, live .env, and temp files
New-Item -ItemType Directory -Path "$staging\backend" | Out-Null
Get-ChildItem "$root\backend" | Where-Object { $_.Name -notin @('node_modules', '.env', '.git') } | ForEach-Object {
    Copy-Item $_.FullName "$staging\backend" -Recurse
}

# Copy frontend excluding node_modules, dist, and live .env
New-Item -ItemType Directory -Path "$staging\frontend" | Out-Null
Get-ChildItem "$root\frontend" | Where-Object { $_.Name -notin @('node_modules', 'dist', '.env', '.git') } | ForEach-Object {
    Copy-Item $_.FullName "$staging\frontend" -Recurse
}

if (Test-Path $zipOut) {
    Remove-Item -Force $zipOut
}

Compress-Archive -Path "$staging\*" -DestinationPath $zipOut -Force
Remove-Item -Recurse -Force $staging

$fi = Get-Item $zipOut
Write-Host "SUCCESS: Final production deliverable created at $($fi.FullName) - Size: $([math]::Round($fi.Length / 1MB, 2)) MB"
