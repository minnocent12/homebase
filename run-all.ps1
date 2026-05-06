Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\run-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\run-frontend.ps1"
