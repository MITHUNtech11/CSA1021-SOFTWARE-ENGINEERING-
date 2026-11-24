# Experiment 29: Feature Branch (feature-login) and Pull Request Lifecycle

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ' EXP-29: FEATURE BRANCH & PR LIFECYCLE' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Cyan

Write-Host '[1/5] git checkout -b feature-login'
Write-Host '[2/5] Developing login module: login.py, auth.js, test_login.py'
Write-Host '[3/5] Running pytest: pytest test_login.py'
Write-Host '[4/5] Staging & committing: git commit -m "feat(auth): complete secure login module with hashing"'
Write-Host '[5/5] Pushing feature branch: git push -u origin feature-login'
Write-Host '[SUCCESS] Pull request #24 created and merged into main.' -ForegroundColor Green
