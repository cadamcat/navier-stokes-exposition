#!/usr/bin/env bash
# Run the exact checks, rebuild the article PDF, restore the narration, or rebuild the film. See README.md for the requirements.
set -euo pipefail
cd "$(dirname "$0")"
LEAN_REPO=https://github.com/openai/NavierStokesAndEuler.git
LEAN_COMMIT=f9e8bc5b38b6e212696e8a30e3e91517af887bbd
case "${1:-}" in
  verify)
    # the source audit and the article check read the pinned Lean source without rebuilding it
    if [ ! -d refs/NavierStokesAndEuler ]; then
      git clone --quiet "$LEAN_REPO" refs/NavierStokesAndEuler
      git -C refs/NavierStokesAndEuler checkout --quiet "$LEAN_COMMIT"
    fi
    test "$(git -C refs/NavierStokesAndEuler rev-parse HEAD)" = "$LEAN_COMMIT"
    # the evidence scripts run in a scratch copy of the article's evidence package, as its README describes
    # (check_identities.py rewrites verify/environment.json); their outputs must equal the released ones
    tmp="$(mktemp -d)"; cp -R article/evidence/. "$tmp/"; ln -s "$PWD/refs/NavierStokesAndEuler" "$tmp/refs/NavierStokesAndEuler"
    (cd "$tmp" && "${PYTHON:-python3}" verify/check_identities.py > identities.json)
    cmp "$tmp/identities.json" verify/identities.json && echo "exact calculations: output identical to verify/identities.json"
    (cd "$tmp" && "${PYTHON:-python3}" verify/source_audit.py --self-test && "${PYTHON:-python3}" verify/source_audit.py > source-audit.json)
    "${PYTHON:-python3}" -c 'import json,sys; a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2])); sys.exit(0 if a==b else 1)' "$tmp/source-audit.json" verify/source-audit.json && echo "source audit: output identical to verify/source-audit.json"
    rm -r "${tmp:?}"
    "${PYTHON:-python3}" verify/check_article.py ;;
  article)
    NODE_MODULES="${NODE_MODULES:-$PWD/studio/node_modules}" article/build.sh ;;
  narration)
    # the narration as released: navier-stokes-exposition-narration.flac from the release assets
    "${PYTHON:-python3}" film/tools/narration_flac.py unpack "${2:-navier-stokes-exposition-narration.flac}" ;;
  film)
    (cd film && "${PYTHON:-python3}" tools/assemble.py) ;;
  *)
    echo "usage: ./build.sh verify | article | narration [FLAC] | film" >&2
    exit 2 ;;
esac
