#!/usr/bin/env python3
"""Run the bounded checks and save actual process exit receipts."""
import datetime
import json
from pathlib import Path
import subprocess
import sys

studio_python = sys.executable
commands = [
    ([sys.executable, 'verify/source_audit.py', '--self-test'], 'verify/source-audit-selftest.log'),
    ([sys.executable, 'verify/source_audit.py'], 'verify/source-audit.json'),
    ([studio_python, 'verify/check_identities.py'], 'verify/identities.json'),
]
receipts = []
for command, destination in commands:
    start = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with Path(destination).open('w') as output:
        result = subprocess.run(command, stdout=output, stderr=subprocess.STDOUT, check=False)
    receipts.append({'command': command, 'output': destination,
                     'started_at_utc': start, 'exit_status': result.returncode})
    print(f'{destination}: exit {result.returncode}', flush=True)
    if result.returncode:
        break
Path('verify/acceptance.json').write_text(json.dumps({
    'scope': 'Python source/statement audit and exact algebra only; Lean build and replay not run',
    'receipts': receipts,
    'passed': len(receipts) == len(commands) and all(r['exit_status'] == 0 for r in receipts)
}, indent=2) + '\n')
raise SystemExit(0 if len(receipts) == len(commands) and all(r['exit_status'] == 0 for r in receipts) else 1)
