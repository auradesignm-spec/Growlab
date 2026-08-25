$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  Write-Error "Install Ollama first: npm run coach:setup"
}
Write-Host "Pulling Qwen 2.5 VL 3B (~3.2GB) for image/video frames..."
ollama pull qwen2.5vl:3b
Write-Host "Set OLLAMA_VISION_MODEL=qwen2.5vl:3b in .env and restart npm run dev"
