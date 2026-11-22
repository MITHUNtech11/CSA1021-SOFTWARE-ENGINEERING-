# Experiment 22: Docker Hub Push and Pull Lifecycle Simulation
# Demonstrates: Login, build, tag, push to registry, prune local, pull, run.

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ' EXP-22: DOCKER HUB PUSH AND PULL SIMULATION' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Cyan

Write-Host '[1/6] docker login -u mithun-dev'
Write-Host '[2/6] docker build -t demo-service:2.0.0 .'
Write-Host '[3/6] docker tag demo-service:2.0.0 mithun-dev/demo-service:2.0.0'
Write-Host '[4/6] docker push mithun-dev/demo-service:2.0.0'
Write-Host '[5/6] docker rmi mithun-dev/demo-service:2.0.0 (Pruning local image)'
Write-Host '[6/6] docker pull mithun-dev/demo-service:2.0.0'
Write-Host '[SUCCESS] Image pushed to and pulled from Docker Hub with verified SHA256 digest.' -ForegroundColor Green
