$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot 'backend'

if (-not (Test-Path $backendPath)) {
  throw 'Backend directory not found.'
}

$files = Get-ChildItem -Path $backendPath -Recurse -Filter *.js |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' }

foreach ($file in $files) {
  node --check $file.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "Syntax check failed: $($file.FullName)"
  }
}

Write-Output "Backend syntax check passed for $($files.Count) file(s)."
