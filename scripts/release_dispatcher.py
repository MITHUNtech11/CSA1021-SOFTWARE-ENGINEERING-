import os
import sys
import json
import subprocess
from datetime import datetime, timezone

def run_cmd(cmd, env=None, check=True):
    print(f"Executing: {' '.join(cmd)}")
    res = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if res.stdout:
        print(res.stdout.strip())
    if res.returncode != 0 and check:
        print(f"Error executing command: {res.stderr.strip()}", file=sys.stderr)
        sys.exit(res.returncode)
    return res

def main():
    dry_run = "--dry-run" in sys.argv
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(repo_root)

    schedule_path = os.path.join(repo_root, "scripts", "release_schedule.json")
    if not os.path.exists(schedule_path):
        print(f"Error: schedule file not found at {schedule_path}")
        sys.exit(1)

    with open(schedule_path, "r", encoding="utf-8") as f:
        schedule = json.load(f)

    # In CI, ensure staging-experiments is fetched
    if not dry_run:
        run_cmd(["git", "fetch", "origin", "staging-experiments"])

    now_utc = datetime.now(timezone.utc)
    print(f"Current UTC Time: {now_utc.isoformat()}")

    released_count = 0
    git_env = os.environ.copy()
    git_env["GIT_AUTHOR_NAME"] = "Mithun"
    git_env["GIT_AUTHOR_EMAIL"] = "mithunsenthils4056.sse@saveetha.com"
    git_env["GIT_COMMITTER_NAME"] = "Mithun"
    git_env["GIT_COMMITTER_EMAIL"] = "mithunsenthils4056.sse@saveetha.com"

    for item in schedule:
        target_time = datetime.fromisoformat(item["release_time"]).astimezone(timezone.utc)
        exp_dir = f"lab/{item['exp']}"
        
        # Check if experiment is due
        is_due = now_utc >= target_time
        exists_in_main = os.path.exists(os.path.join(repo_root, exp_dir))

        if is_due and not exists_in_main:
            print(f"[RELEASE DUE] {item['exp']} (Scheduled: {item['release_time']})")
            if dry_run:
                print(f"  [DRY RUN] Would checkout and commit {exp_dir} with: {item['commit_msg']}")
                released_count += 1
            else:
                # Checkout specific experiment directory from staging-experiments
                run_cmd(["git", "checkout", "origin/staging-experiments", "--", exp_dir])
                run_cmd(["git", "add", exp_dir])
                
                # Set commit timestamp to scheduled release time if earlier today
                git_env["GIT_AUTHOR_DATE"] = item["release_time"]
                git_env["GIT_COMMITTER_DATE"] = item["release_time"]
                
                run_cmd(["git", "commit", "-m", item["commit_msg"]], env=git_env)
                released_count += 1
        elif not exists_in_main:
            print(f"[PENDING] {item['exp']} scheduled for {item['release_time']} (Not yet due)")

    if released_count > 0:
        print(f"Successfully released {released_count} experiment(s).")
        if not dry_run:
            print("Pushing commits to origin main...")
            run_cmd(["git", "push", "origin", "main"])
    else:
        print("No new experiments due for release at this time.")

if __name__ == "__main__":
    main()
