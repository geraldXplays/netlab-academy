#!/usr/bin/env python3
"""Deploy dist/ to Netlify, keeping hashed /assets/* files from recent deploys.

Browser tabs opened before a deploy still reference the old chunk names; carrying
those files forward means a stale tab never hits a missing file. Netlify dedupes
by SHA1, so carried-over files are referenced, not re-uploaded.

Usage: NETLIFY_AUTH_TOKEN=... python3 scripts/deploy.py [site-name] [keep-deploys]
"""
import hashlib, json, os, ssl, sys, time, urllib.request
from pathlib import Path

SITE = sys.argv[1] if len(sys.argv) > 1 else "netlab-academy"
KEEP = int(sys.argv[2]) if len(sys.argv) > 2 else 15
API = "https://api.netlify.com/api/v1"
TOKEN = os.environ.get("NETLIFY_AUTH_TOKEN", "proxy-injected")
DIST = Path(__file__).resolve().parent.parent / "dist"
ca = "/root/.ccr/ca-bundle.crt"
CTX = ssl.create_default_context(cafile=ca) if os.path.exists(ca) else ssl.create_default_context()

def call(method, path, body=None, ctype="application/json"):
    data = json.dumps(body).encode() if ctype == "application/json" and body is not None else body
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": ctype})
    with urllib.request.urlopen(req, context=CTX, timeout=120) as r:
        raw = r.read()
        return json.loads(raw) if raw else None

site = call("GET", f"/sites?name={SITE}")[0]
sid = site["id"]

# Local build
local = {}
for f in DIST.rglob("*"):
    if f.is_file():
        local["/" + f.relative_to(DIST).as_posix()] = (f, hashlib.sha1(f.read_bytes()).hexdigest())
manifest = {p: sha for p, (_, sha) in local.items()}

# Carry forward hashed assets from recent ready deploys
carried = 0
deploys = [d for d in call("GET", f"/sites/{sid}/deploys?per_page={KEEP}") if d.get("state") == "ready"]
for d in deploys:
    page = 1
    while True:
        files = call("GET", f"/deploys/{d['id']}/files?per_page=100&page={page}") or []
        for f in files:
            p = f["id"]
            if p.startswith("/assets/") and p not in manifest and p.lower() not in {k.lower() for k in manifest}:
                manifest[p] = f["sha"]; carried += 1
        if len(files) < 100: break
        page += 1

dep = call("POST", f"/sites/{sid}/deploys", {"files": manifest})
did, required = dep["id"], set(dep.get("required") or [])
print(f"deploy {did}: {len(local)} built files, {carried} carried-over assets, {len(required)} to upload")
for p, (f, sha) in local.items():
    if sha in required:
        call("PUT", f"/deploys/{did}/files{p}", f.read_bytes(), "application/octet-stream")
        required.discard(sha)
for _ in range(60):
    st = call("GET", f"/deploys/{did}")["state"]
    if st in ("ready", "error"): break
    time.sleep(2)
print("state:", st, "->", site.get("ssl_url") or site.get("url"))
sys.exit(0 if st == "ready" else 1)
