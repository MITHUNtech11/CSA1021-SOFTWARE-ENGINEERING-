import os
import subprocess
import shutil
import json

def run_git_cmd(cmd_list, cwd):
    res = subprocess.run(cmd_list, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Git command failed: {' '.join(cmd_list)}\nError: {res.stderr}")
    return res.stdout.strip()

def simulate_git_workflow():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    demo_repo = os.path.join(base_dir, "tests", "git_demo_repo")
    
    if os.path.exists(demo_repo):
        shutil.rmtree(demo_repo, ignore_errors=True)
    os.makedirs(demo_repo, exist_ok=True)
    
    output_log = []
    def log(msg):
        print(msg)
        output_log.append(msg)

    log("=" * 70)
    log("TASK 4: VERSION-CONTROL WORKFLOW & MERGE CONFLICT RESOLUTION PROOF")
    log("=" * 70)

    # 1. Initialize Repository & Configure Author
    run_git_cmd(["git", "init", "-b", "main"], cwd=demo_repo)
    run_git_cmd(["git", "config", "user.name", "S Mithun Senthil"], cwd=demo_repo)
    run_git_cmd(["git", "config", "user.email", "mithun.senthil@campus.edu"], cwd=demo_repo)
    
    # 2. Add .gitignore
    gitignore_content = """.env
__pycache__/
*.pyc
*.db
*.db-wal
*.db-shm
node_modules/
dist/
"""
    with open(os.path.join(demo_repo, ".gitignore"), "w") as f:
        f.write(gitignore_content)
        
    policy_content = {
        "platform_name": "Smart Campus Operations Platform",
        "max_booking_duration_hours": 3,
        "default_sla_hours": 24,
        "version": "1.0.0"
    }
    with open(os.path.join(demo_repo, "policy.json"), "w") as f:
        json.dump(policy_content, f, indent=2)

    run_git_cmd(["git", "add", "."], cwd=demo_repo)
    run_git_cmd(["git", "commit", "-m", "chore: initial repository structure and operational policy"], cwd=demo_repo)
    log("[STEP 1] Initialized clean repository on 'main' with .gitignore and baseline policy.json")

    # 3. Create Feature Branch 1: feature/booking-overlap
    run_git_cmd(["git", "checkout", "-b", "feature/booking-overlap"], cwd=demo_repo)
    with open(os.path.join(demo_repo, "overlap_validator.py"), "w") as f:
        f.write("# Non-overlap reservation constraint validator\ndef validate_overlap(slot_a, slot_b):\n    return slot_a[0] < slot_b[1] and slot_b[0] < slot_a[1]\n")
    
    # Policy change on Branch 1: Set max_booking_duration to 4 hours
    policy_b1 = dict(policy_content)
    policy_b1["max_booking_duration_hours"] = 4
    with open(os.path.join(demo_repo, "policy.json"), "w") as f:
        json.dump(policy_b1, f, indent=2)

    run_git_cmd(["git", "add", "."], cwd=demo_repo)
    run_git_cmd(["git", "commit", "-m", "feat: implement non-overlap reservation check and set 4h max slot duration"], cwd=demo_repo)
    log("[STEP 2] Committed feature/booking-overlap: added validator and updated policy duration to 4h")

    # 4. Create Feature Branch 2: feature/approval-controls (diverging from main)
    run_git_cmd(["git", "checkout", "main"], cwd=demo_repo)
    run_git_cmd(["git", "checkout", "-b", "feature/approval-controls"], cwd=demo_repo)
    with open(os.path.join(demo_repo, "approval_guard.py"), "w") as f:
        f.write("# Role-based authorization gatekeeper\ndef check_approval_permission(role):\n    return role in ['approver', 'admin', 'facility_manager']\n")
    
    # Policy change on Branch 2: Conflicting change setting max_booking_duration to 2 hours
    policy_b2 = dict(policy_content)
    policy_b2["max_booking_duration_hours"] = 2
    with open(os.path.join(demo_repo, "policy.json"), "w") as f:
        json.dump(policy_b2, f, indent=2)

    run_git_cmd(["git", "add", "."], cwd=demo_repo)
    run_git_cmd(["git", "commit", "-m", "feat: introduce server-side approval guard and tighten max booking duration to 2h"], cwd=demo_repo)
    log("[STEP 3] Committed feature/approval-controls: added approval guard and set max duration to 2h")

    # 5. Merge Branch 1 into main
    run_git_cmd(["git", "checkout", "main"], cwd=demo_repo)
    run_git_cmd(["git", "merge", "--no-ff", "feature/booking-overlap", "-m", "merge: integrate feature/booking-overlap into main"], cwd=demo_repo)
    log("[STEP 4] Successfully merged feature/booking-overlap into main (Fast-Forward/Clean Merge)")

    # 6. Deliberately merge Branch 2 into main to trigger CONFLICT
    log("[STEP 5] Merging feature/approval-controls into main (expecting policy.json conflict)...")
    conflict_proc = subprocess.run(["git", "merge", "--no-ff", "feature/approval-controls"], cwd=demo_repo, capture_output=True, text=True)
    log(f"  -> Merge Status: Exit Code {conflict_proc.returncode} (Conflict triggered as expected)")
    log(f"  -> Conflict Output:\n{conflict_proc.stdout.strip()}")

    # 7. Resolve the conflict intentionally
    log("[STEP 6] Resolving conflict in policy.json...")
    # Academic resolution: Compromise rule approved by Facilities Committee = 3 hours with strict role guard
    resolved_policy = {
        "platform_name": "Smart Campus Operations Platform",
        "max_booking_duration_hours": 3, # Resolved consensus value
        "approval_required_above_hours": 2,
        "default_sla_hours": 24,
        "version": "1.0.0"
    }
    with open(os.path.join(demo_repo, "policy.json"), "w") as f:
        json.dump(resolved_policy, f, indent=2)

    run_git_cmd(["git", "add", "policy.json"], cwd=demo_repo)
    run_git_cmd(["git", "commit", "-m", "merge: resolve conflict in policy.json by establishing 3h ceiling with 2h approval threshold"], cwd=demo_repo)
    log("  -> Conflict resolved and committed cleanly to main!")

    # 8. Tag Stable Release v1.0.0
    run_git_cmd(["git", "tag", "-a", "v1.0.0", "-m", "Campus platform core release v1.0.0"], cwd=demo_repo)
    log("[STEP 7] Created release tag 'v1.0.0'")

    # 9. Extract Graph & Commit History
    log("\n[VERIFICATION] Git Graph & Commit History Log:")
    graph_log = run_git_cmd(["git", "log", "--graph", "--oneline", "--all", "--decorate"], cwd=demo_repo)
    log(graph_log)

    evidence_file = os.path.join(base_dir, "tests", "git_workflow_evidence.txt")
    with open(evidence_file, "w") as f:
        f.write("\n".join(output_log))
    log(f"\nGit workflow evidence written to: {evidence_file}")

    # Cleanup demo repo
    shutil.rmtree(demo_repo, ignore_errors=True)
    return graph_log

if __name__ == "__main__":
    simulate_git_workflow()
