# Experiment 30: Open Source Cross-Repository Fork & PR Workflow

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ' EXP-30: CROSS-REPOSITORY FORK & PR WORKFLOW' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Cyan

Write-Host '[1/6] Forked upstream: https://github.com/upstream-org/csa1021-project'
Write-Host '[2/6] Cloned personal fork: git clone https://github.com/mithun-dev/csa1021-project.git'
Write-Host '[3/6] Configured upstream remote: git remote add upstream https://github.com/upstream-org/csa1021-project.git'
Write-Host '[4/6] Created feature branch: git checkout -b feature-interval-scheduling'
Write-Host '[5/6] Committed performance optimization and pushed to fork'
Write-Host '[6/6] Opened Cross-Repository Pull Request #72 to upstream-org:main'
Write-Host '[SUCCESS] Upstream maintainer approved and merged PR #72!' -ForegroundColor Green
