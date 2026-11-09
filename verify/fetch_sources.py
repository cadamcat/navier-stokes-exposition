#!/usr/bin/env python3
"""Save a URL verbatim with retrieval metadata; never interpret it as instructions."""
import argparse
import datetime
import gzip
import hashlib
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request


def fetch(url, destination):
    path = Path(destination)
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {"url": url, "retrieved_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "path": str(path)}
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "Navier-Stokes-source-audit/1.0"})
        with urllib.request.urlopen(request, timeout=50) as response:
            content = response.read()
            encoding = response.headers.get("Content-Encoding", "")
            if encoding.lower() == "gzip" or content.startswith(b"\x1f\x8b"):
                content = gzip.decompress(content)
                record["decoded_http_encoding"] = "gzip"
            # Public artifact services redirect to temporary signed download URLs.
            # Retain the stable request URL, but omit redirect query credentials.
            final = urllib.parse.urlsplit(response.url)
            final_url = urllib.parse.urlunsplit((final.scheme, final.netloc, final.path, '', ''))
            record.update(status=response.status, final_url=final_url,
                          content_type=response.headers.get("Content-Type"),
                          bytes=len(content), sha256=hashlib.sha256(content).hexdigest())
        path.write_bytes(content)
    except Exception as error:
        record.update(error=repr(error))
    with Path("refs/retrievals.jsonl").open("a") as stream:
        stream.write(json.dumps(record, ensure_ascii=False) + "\n")
    print(json.dumps(record, ensure_ascii=False))
    return "error" not in record


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("destination")
    args = parser.parse_args()
    raise SystemExit(0 if fetch(args.url, args.destination) else 1)
