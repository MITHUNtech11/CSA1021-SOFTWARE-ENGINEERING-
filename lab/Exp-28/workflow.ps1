# Experiment 28: Fetching and Pulling Collaborator Changes from GitHub

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ' EXP-28: PULLING COLLABORATOR CHANGES' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Cyan

Write-Host '[1/4] Inspecting remote status: git fetch origin'
Write-Host '[2/4] Comparing local vs remote differences: git log HEAD..origin/main --oneline'
Write-Host '[3/4] Pulling incoming updates: git pull origin main'
Write-Host '[4/4] Verifying synchronized commit graph: git log -2'
Write-Host '[SUCCESS] Fast-forward merge completed; local working tree synchronized.' -ForegroundColor Green
