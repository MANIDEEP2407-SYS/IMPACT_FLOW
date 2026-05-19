Param()
$collection = Join-Path -Path $PSScriptRoot -ChildPath "..\postman\ImpactFlow.postman_collection.json"
$envfile = Join-Path -Path $PSScriptRoot -ChildPath "..\postman\ImpactFlow.postman_environment.json"
$reportDir = Join-Path -Path $PSScriptRoot -ChildPath "..\postman\reports"
if (!(Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir | Out-Null }

# Run via npx (will install newman temporarily if needed)
$npx = "npx"
$logFile = Join-Path $reportDir 'report.txt'
& $npx newman run $collection -e $envfile --insecure --reporters cli 2>&1 | Tee-Object -FilePath $logFile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Output "Reports written to $logFile"
