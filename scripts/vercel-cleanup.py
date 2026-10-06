#!/usr/bin/env python3
"""Keep the newest N Vercel deployments per group and delete the rest.

Groups: production, preview, errored, canceled.
The deployment currently live in production is NEVER deleted.

Env vars:
  VERCEL_TOKEN       (required) Vercel access token
  VERCEL_PROJECT_ID  (required) project id or project name
  VERCEL_TEAM_ID     (optional) team id, leave empty for a personal account
  KEEP               (optional) how many to keep per group, default 10
  DRY_RUN            (optional) "true" (default) only prints; "false" deletes
"""
import os
import sys
import time

import requests

API = "https://api.vercel.com"
TOKEN = os.environ.get("VERCEL_TOKEN", "").strip()
PROJECT = os.environ.get("VERCEL_PROJECT_ID", "").strip()
TEAM = os.environ.get("VERCEL_TEAM_ID", "").strip()
KEEP = int(os.environ.get("KEEP", "10"))
DRY_RUN = os.environ.get("DRY_RUN", "true").strip().lower() != "false"

if not TOKEN or not PROJECT:
    sys.exit("Set VERCEL_TOKEN and VERCEL_PROJECT_ID.")

HEADERS = {"Authorization": f"Bearer {TOKEN}"}


def params(extra=None):
    p = {"teamId": TEAM} if TEAM else {}
    if extra:
        p.update(extra)
    return p


def get_live_production_id():
    """ID of the deployment currently serving production (protected)."""
    r = requests.get(f"{API}/v9/projects/{PROJECT}", headers=HEADERS, params=params(), timeout=30)
    r.raise_for_status()
    prod = (r.json().get("targets") or {}).get("production") or {}
    return prod.get("id")


def list_all_deployments():
    deployments, until = [], None
    while True:
        extra = {"projectId": PROJECT, "limit": 100}
        if until:
            extra["until"] = until
        r = requests.get(f"{API}/v6/deployments", headers=HEADERS, params=params(extra), timeout=30)
        r.raise_for_status()
        data = r.json()
        deployments.extend(data.get("deployments", []))
        until = (data.get("pagination") or {}).get("next")
        if not until:
            return deployments


def group_of(d):
    state = (d.get("state") or d.get("readyState") or "").upper()
    if state == "ERROR":
        return "errored"
    if state == "CANCELED":
        return "canceled"
    if state == "READY":
        return "production" if d.get("target") == "production" else "preview"
    return None  # BUILDING / QUEUED / etc: never touch


def main():
    print(f"Mode: {'DRY RUN (nothing will be deleted)' if DRY_RUN else 'LIVE (deleting)'} | keep={KEEP}")
    live_id = get_live_production_id()
    print(f"Live production deployment (protected): {live_id}")

    groups = {"production": [], "preview": [], "errored": [], "canceled": []}
    for d in list_all_deployments():
        g = group_of(d)
        if g:
            groups[g].append(d)

    to_delete = []
    for name, items in groups.items():
        items.sort(key=lambda d: d.get("created", 0), reverse=True)  # newest first
        keep, extra = items[:KEEP], items[KEEP:]
        extra = [d for d in extra if d["uid"] != live_id]
        print(f"{name}: total={len(items)} keep={len(keep)} delete={len(extra)}")
        to_delete.extend((name, d) for d in extra)

    if not to_delete:
        print("Nothing to delete.")
        return

    failed = 0
    for name, d in to_delete:
        created = time.strftime("%Y-%m-%d %H:%M", time.gmtime(d.get("created", 0) / 1000))
        label = f"[{name}] {d.get('url')} ({d['uid']}) created {created} UTC"
        if DRY_RUN:
            print(f"WOULD DELETE {label}")
            continue
        r = requests.delete(f"{API}/v13/deployments/{d['uid']}", headers=HEADERS, params=params(), timeout=30)
        if r.ok:
            print(f"DELETED {label}")
        else:
            failed += 1
            print(f"FAILED {label} -> {r.status_code} {r.text[:200]}")
        time.sleep(0.3)  # be gentle with rate limits

    print(f"Done. {len(to_delete)} candidate(s), {failed} failure(s).")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
