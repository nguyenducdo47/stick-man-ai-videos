# Wrapper for CC0 GLB install (see manifest in .mjs)
param(
  [switch]$List,
  [switch]$SmokeTest,
  [switch]$ConfirmDownload
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

if ($List) {
  node "$PSScriptRoot\install-cc0-glb-assets.mjs" --list
} elseif ($SmokeTest) {
  node "$PSScriptRoot\install-cc0-glb-assets.mjs" --smoke-test
} elseif ($ConfirmDownload) {
  node "$PSScriptRoot\install-cc0-glb-assets.mjs" --confirm-download
} else {
  node "$PSScriptRoot\install-cc0-glb-assets.mjs" --list
}