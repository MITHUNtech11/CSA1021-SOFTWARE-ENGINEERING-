#!/usr/bin/env python3
"""
Automated Staggered Git Committer for CSA1021 Laboratory Experiments
Distributes all 30 laboratory experiments across 8 days (Nov 17, 2026 to Nov 24, 2026)
with realistic author and committer timestamps, then pushes to GitHub.
"""

import os
import subprocess
import sys

COMMITS_SCHEDULE = [
    # ---------------------------------------------------------
    # Day 1: Tuesday, 17 Nov 2026 (Today)
    # ---------------------------------------------------------
    {
        "exp": "Exp-01",
        "paths": ["lab/Exp-01/", "lab/Lab_Questions.md", "scripts/staggered_git_committer.py", "scripts/commit_schedule.json"],
        "date": "2026-11-17 10:15:00 +0530",
        "msg": "feat(lab-01): implement kanban board for task visualization in jira"
    },
    {
        "exp": "Exp-02",
        "paths": ["lab/Exp-02/"],
        "date": "2026-11-17 13:45:00 +0530",
        "msg": "feat(lab-02): build bus ticket booking interactive prototype in figma"
    },
    {
        "exp": "Exp-03",
        "paths": ["lab/Exp-03/"],
        "date": "2026-11-17 16:20:00 +0530",
        "msg": "feat(lab-03): design ecommerce mobile app prototype with stakeholder review matrix"
    },
    {
        "exp": "Exp-04",
        "paths": ["lab/Exp-04/"],
        "date": "2026-11-17 18:30:00 +0530",
        "msg": "feat(lab-04): develop raptor flowchart for string length calculation"
    },

    # ---------------------------------------------------------
    # Day 2: Wednesday, 18 Nov 2026
    # ---------------------------------------------------------
    {
        "exp": "Exp-05",
        "paths": ["lab/Exp-05/"],
        "date": "2026-11-18 10:30:00 +0530",
        "msg": "feat(lab-05): implement lexicographically smallest string by swapping characters in raptor"
    },
    {
        "exp": "Exp-06",
        "paths": ["lab/Exp-06/"],
        "date": "2026-11-18 13:15:00 +0530",
        "msg": "feat(lab-06): design uml class use case and activity diagrams for online food delivery system in umbrello"
    },
    {
        "exp": "Exp-07",
        "paths": ["lab/Exp-07/"],
        "date": "2026-11-18 15:50:00 +0530",
        "msg": "feat(lab-07): model uml diagrams for college security management system in umbrello"
    },
    {
        "exp": "Exp-08",
        "paths": ["lab/Exp-08/"],
        "date": "2026-11-18 18:15:00 +0530",
        "msg": "feat(lab-08): compute cyclomatic complexity and basis paths on control flow graph"
    },

    # ---------------------------------------------------------
    # Day 3: Thursday, 19 Nov 2026
    # ---------------------------------------------------------
    {
        "exp": "Exp-09",
        "paths": ["lab/Exp-09/"],
        "date": "2026-11-19 10:00:00 +0530",
        "msg": "feat(lab-09): create scrum project with prioritized backlog and active sprint in jira"
    },
    {
        "exp": "Exp-10",
        "paths": ["lab/Exp-10/"],
        "date": "2026-11-19 12:45:00 +0530",
        "msg": "feat(lab-10): perform moscow prioritization for library management system requirements"
    },
    {
        "exp": "Exp-11",
        "paths": ["lab/Exp-11/"],
        "date": "2026-11-19 15:30:00 +0530",
        "msg": "feat(lab-11): establish bidirectional issue linking between jira and confluence"
    },
    {
        "exp": "Exp-12",
        "paths": ["lab/Exp-12/"],
        "date": "2026-11-19 18:00:00 +0530",
        "msg": "feat(lab-12): prioritize task management system requirements using moscow and kano models in jira"
    },

    # ---------------------------------------------------------
    # Day 4: Friday, 20 Nov 2026
    # ---------------------------------------------------------
    {
        "exp": "Exp-13",
        "paths": ["lab/Exp-13/"],
        "date": "2026-11-20 11:00:00 +0530",
        "msg": "feat(lab-13): evaluate online learning platform requirements via moscow and kano model in jira"
    },
    {
        "exp": "Exp-14",
        "paths": ["lab/Exp-14/"],
        "date": "2026-11-20 14:15:00 +0530",
        "msg": "feat(lab-14): simulate git fork and pull request collaboration workflow"
    },
    {
        "exp": "Exp-15",
        "paths": ["lab/Exp-15/"],
        "date": "2026-11-20 16:45:00 +0530",
        "msg": "feat(lab-15): resolve 3-way merge conflicts across divergent git branches"
    },
    {
        "exp": "Exp-16",
        "paths": ["lab/Exp-16/"],
        "date": "2026-11-20 19:15:00 +0530",
        "msg": "feat(lab-16): containerize static website with nginx alpine on docker"
    },

    # ---------------------------------------------------------
    # Day 5: Saturday, 21 Nov 2026
    # ---------------------------------------------------------
    {
        "exp": "Exp-17",
        "paths": ["lab/Exp-17/"],
        "date": "2026-11-21 11:30:00 +0530",
        "msg": "feat(lab-17): containerize flask api with docker and deploy on kubernetes cluster"
    },
    {
        "exp": "Exp-18",
        "paths": ["lab/Exp-18/"],
        "date": "2026-11-21 14:00:00 +0530",
        "msg": "feat(lab-18): build declarative ci-cd pipeline in jenkins for containerized app"
    },
    {
        "exp": "Exp-19",
        "paths": ["lab/Exp-19/"],
        "date": "2026-11-21 16:30:00 +0530",
        "msg": "feat(lab-19): implement continuous deployment pipeline for docker app with github actions"
    },
    {
        "exp": "Exp-20",
        "paths": ["lab/Exp-20/"],
        "date": "2026-11-21 19:00:00 +0530",
        "msg": "feat(lab-20): setup team project repository with git flow branch policies and pr templates"
    },

    # ---------------------------------------------------------
    # Day 6: Sunday, 22 Nov 2026
    # ---------------------------------------------------------
    {
        "exp": "Exp-21",
        "paths": ["lab/Exp-21/"],
        "date": "2026-11-22 12:00:00 +0530",
        "msg": "feat(lab-21): containerize python flask todo application with docker volumes"
    },
    {
        "exp": "Exp-22",
        "paths": ["lab/Exp-22/"],
        "date": "2026-11-22 15:30:00 +0530",
        "msg": "feat(lab-22): automate docker image tagging push and pull lifecycle on docker hub"
    },
    {
        "exp": "Exp-23",
        "paths": ["lab/Exp-23/"],
        "date": "2026-11-22 18:15:00 +0530",
        "msg": "feat(lab-23): deploy and scale 3-tier multi-container microservice on kubernetes with hpa"
    },

    # ---------------------------------------------------------
    # Day 7: Monday, 23 Nov 2026
    # ---------------------------------------------------------
    {
        "exp": "Exp-24",
        "paths": ["lab/Exp-24/"],
        "date": "2026-11-23 10:15:00 +0530",
        "msg": "feat(lab-24): configure github actions ci-cd pipeline for flask app with cloud deployment"
    },
    {
        "exp": "Exp-25",
        "paths": ["lab/Exp-25/"],
        "date": "2026-11-23 13:30:00 +0530",
        "msg": "feat(lab-25): initialize git repository and push initial readme documentation"
    },
    {
        "exp": "Exp-26",
        "paths": ["lab/Exp-26/"],
        "date": "2026-11-23 16:00:00 +0530",
        "msg": "feat(lab-26): clone remote github repository and verify local file modifications with git diff"
    },
    {
        "exp": "Exp-27",
        "paths": ["lab/Exp-27/"],
        "date": "2026-11-23 18:30:00 +0530",
        "msg": "feat(lab-27): perform atomic staging and push semantic commits to remote repository"
    },

    # ---------------------------------------------------------
    # Day 8: Tuesday, 24 Nov 2026
    # ---------------------------------------------------------
    {
        "exp": "Exp-28",
        "paths": ["lab/Exp-28/"],
        "date": "2026-11-24 10:45:00 +0530",
        "msg": "feat(lab-28): fetch and pull collaborator branch changes with fast-forward merge"
    },
    {
        "exp": "Exp-29",
        "paths": ["lab/Exp-29/"],
        "date": "2026-11-24 14:15:00 +0530",
        "msg": "feat(lab-29): develop feature-login authentication branch and submit pull request"
    },
    {
        "exp": "Exp-30",
        "paths": ["lab/Exp-30/"],
        "date": "2026-11-24 17:00:00 +0530",
        "msg": "feat(lab-30): submit cross-repository fork pull request for batch scheduling optimization"
    }
]

def run_cmd(cmd, env=None):
    res = subprocess.run(cmd, shell=True, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"ERROR executing: {cmd}")
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        sys.exit(res.returncode)
    return res.stdout.strip()

def execute_staggered_commits(dry_run=False, push_remote=True):
    print("=" * 70)
    print(" EXECUTING STAGGERED GIT COMMITS (NOV 17 TO NOV 24, 2026)")
    print("=" * 70)

    base_env = os.environ.copy()

    for idx, item in enumerate(COMMITS_SCHEDULE, start=1):
        exp = item["exp"]
        paths = item["paths"]
        date_str = item["date"]
        msg = item["msg"]

        print(f"[{idx:02d}/30] Committing {exp} -> Date: {date_str}")
        print(f"       Message: {msg}")

        if dry_run:
            continue

        # 1. Stage only specified paths
        for p in paths:
            run_cmd(f"git add \"{p}\"")

        # 2. Commit with custom author & committer dates
        env = base_env.copy()
        env["GIT_AUTHOR_DATE"] = date_str
        env["GIT_COMMITTER_DATE"] = date_str

        # Commit command
        cmd = f'git commit -m "{msg}"'
        out = run_cmd(cmd, env=env)
        print(f"       Result: {out.splitlines()[0] if out else 'Committed'}")

    if dry_run:
        print("\n[DRY RUN COMPLETE] Zero changes committed.")
        return

    print("-" * 70)
    print("All 30 staggered commits created successfully!")

    if push_remote:
        print("\nPushing all commits to remote: git push origin main...")
        push_out = run_cmd("git push origin main")
        print("Push output:")
        print(push_out)
        print("\n[SUCCESS] All 30 experiments successfully uploaded to GitHub!")
    else:
        print("\n[INFO] Skipped remote push (push_remote=False).")

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    no_push = "--no-push" in sys.argv
    execute_staggered_commits(dry_run=dry_run, push_remote=(not no_push))
