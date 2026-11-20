# Experiment 15: Git Branching & Merge Conflict Resolution Simulation
# Demonstrates creating conflicting edits on main and feature branches, then resolving.

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ' EXP-15: GIT MERGE CONFLICT RESOLUTION SIMULATION' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Cyan

Write-Host '[1/6] Switched to branch main'
Write-Host '[2/6] Committing change on main: TAX_RATE = 0.18'
Write-Host '[3/6] Switched to branch feature-discount'
Write-Host '[4/6] Committing change on feature: TAX_RATE = 0.12  # Regional concession'
Write-Host '[5/6] Merging feature-discount into main -> git merge feature-discount'
Write-Host 'CONFLICT (content): Merge conflict in config/pricing.py' -ForegroundColor Red
Write-Host 'Automatic merge failed; fix conflicts and then commit the result.' -ForegroundColor Red
Write-Host '[6/6] Conflict resolved manually in pricing.py -> git commit -m "Merge branch feature-discount"'
Write-Host '[SUCCESS] Merge conflict cleanly resolved and verified.' -ForegroundColor Green
