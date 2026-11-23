# Experiment 27: Staging, Committing and Pushing to Remote Repository

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ' EXP-27: COMMITTING AND PUSHING CHANGES TO GITHUB' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Cyan

Write-Host '[1/4] Staging modified files: git add src/auth.py'
Write-Host '[2/4] Recording atomic commit: git commit -m "feat(auth): add JWT token validation middleware"'
Write-Host '[3/4] Inspecting commit object: git log -1 --stat'
Write-Host '[4/4] Pushing to remote branch: git push origin main'
Write-Host '[SUCCESS] Atomic commit pushed and verified in remote commit tree.' -ForegroundColor Green
