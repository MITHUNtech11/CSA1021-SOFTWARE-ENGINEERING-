# Experiment 14: Fork and Pull Request Workflow Simulation
# Demonstrates: Forking, cloning fork, setting upstream, branching, pushing, PR.

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ' EXP-14: FORK & PULL REQUEST WORKFLOW SIMULATION' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Cyan

# 1. Clone user fork
Write-Host '[1/5] Cloning forked repository: git clone https://github.com/mithun-dev/csa1021-project.git'
# 2. Configure upstream remote
Write-Host '[2/5] Adding upstream remote: git remote add upstream https://github.com/saveetha-org/csa1021-project.git'
# 3. Create feature branch
Write-Host '[3/5] Creating feature branch: git checkout -b feature-payment-adapter'
# 4. Commit changes
Write-Host '[4/5] Staging & committing changes: git commit -m "feat: implement mock payment gateway adapter"'
# 5. Push to fork origin
Write-Host '[5/5] Pushing to fork: git push -u origin feature-payment-adapter'
Write-Host '[SUCCESS] Pull Request opened: https://github.com/saveetha-org/csa1021-project/pull/18' -ForegroundColor Green
