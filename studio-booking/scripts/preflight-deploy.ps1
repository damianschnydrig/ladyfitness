# Checks .env for required keys before build/deploy (does not print secret values).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"
if (-not (Test-Path $envFile)) {
  Write-Error "Missing file: $envFile - copy from .env.example and fill in."
}
$raw = Get-Content $envFile -Raw
$required = @(
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL"
)
$missing = @()
foreach ($key in $required) {
  if ($raw -notmatch "(?m)^\s*$key\s*=\s*.+\S") {
    $missing += $key
  }
}
if ($missing.Count -gt 0) {
  Write-Error "Missing or empty in .env: $($missing -join ', ')"
}
Write-Host "OK: required variables present in .env."
Write-Host "Also set RESEND_API_KEY, MAIL_FROM, OPERATOR_EMAIL for outbound mail."
