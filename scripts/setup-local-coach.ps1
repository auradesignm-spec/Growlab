$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Have-Ollama {
  return [bool](Get-Command ollama -ErrorAction SilentlyContinue)
}

if (-not (Have-Ollama)) {
  Write-Host "Installing Ollama (free local LLM runtime)..."
  winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

if (-not (Have-Ollama)) {
  Write-Error "Ollama CLI still not on PATH. Open a new terminal after install, then: npm run coach:setup"
}

Write-Host "Pulling Qwen 2.5 3B (fits RTX 2070 8GB; Apache-2.0)..."
ollama pull qwen2.5:3b

Write-Host "Creating growlab-coach (persona, not weight LoRA)..."
ollama create growlab-coach -f "$root\ollama\Modelfile"

Write-Host "Smoke test JSON..."
$probe = ollama run growlab-coach "Reply with JSON only: {`"ok`":true}"
Write-Host $probe
Write-Host "Done. Restart npm run dev. Set OLLAMA_MODEL=growlab-coach in .env"
