import subprocess
import json
import urllib.request
import zipfile
import io
import os
import sys

def main():
    print("Getting GitHub token...")
    p = subprocess.Popen(
        ['git', 'credential', 'fill'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    out, _ = p.communicate("protocol=https\nhost=github.com\nusername=tiantianking\n\n")
    token = None
    for line in out.splitlines():
        if line.startswith('password='):
            token = line.split('=', 1)[1].strip()
            break

    if not token:
        raise RuntimeError("No token found")

    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'BuzzDownloader'
    }

    print("Fetching workflow runs from tiantianking/buzz...")
    req = urllib.request.Request("https://api.github.com/repos/tiantianking/buzz/actions/runs", headers=headers)
    with urllib.request.urlopen(req) as resp:
        runs_data = json.loads(resp.read().decode())

    target_run = None
    for r in runs_data.get("workflow_runs", []):
        if r["name"] == "Windows Canary" and r["conclusion"] == "success":
            target_run = r
            break

    if not target_run:
        raise RuntimeError("No successful Windows Canary run found")

    print(f"Target run ID: {target_run['id']} ({target_run['name']})")

    art_req = urllib.request.Request(target_run["artifacts_url"], headers=headers)
    with urllib.request.urlopen(art_req) as resp:
        art_data = json.loads(resp.read().decode())

    artifacts = art_data.get("artifacts", [])
    if not artifacts:
        raise RuntimeError("No artifacts found")

    target_art = artifacts[0]
    size_mb = target_art['size_in_bytes'] / (1024 * 1024)
    print(f"Target artifact: {target_art['name']} ({size_mb:.2f} MB)")
    download_url = target_art["archive_download_url"]

    print("Resolving pre-signed download URL...")
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener(NoRedirect)
    dl_req = urllib.request.Request(download_url, headers=headers)
    
    redirect_url = None
    try:
        resp = opener.open(dl_req)
        redirect_url = resp.geturl()
    except urllib.error.HTTPError as e:
        if e.code in (301, 302, 303, 307):
            redirect_url = e.headers['Location']
        else:
            raise

    if not redirect_url:
        raise RuntimeError("Could not resolve redirect URL")

    print(f"Downloading {size_mb:.2f} MB from Azure Blob Storage...")
    clean_req = urllib.request.Request(redirect_url, headers={'User-Agent': 'BuzzDownloader'})
    
    with urllib.request.urlopen(clean_req) as resp:
        zip_bytes = resp.read()

    print(f"Download complete ({len(zip_bytes)} bytes). Extracting...")
    target_exe = r"D:\Buzz\buzz_0.5.28_setup.exe"
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for name in z.namelist():
            print(f"  Entry: {name}")
            if name.endswith("setup.exe"):
                data = z.read(name)
                with open(target_exe, "wb") as f:
                    f.write(data)
                print(f"Extracted to: {target_exe} ({len(data)} bytes)")

    if os.path.exists(target_exe) and os.path.getsize(target_exe) > 1000000:
        print("\n==============================================")
        print("SUCCESS! Buzz installer is downloaded and ready in D:\\Buzz!")
        print(f"Path: {target_exe}")
        print(f"Size: {os.path.getsize(target_exe)} bytes")
        print("==============================================")
    else:
        raise RuntimeError("Failed to extract valid setup.exe")

if __name__ == "__main__":
    main()
