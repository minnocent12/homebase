Set-Location "$PSScriptRoot\homebase-frontend"
if (-not (Test-Path "node_modules")) { npm install }
npm run dev
