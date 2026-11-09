#!/bin/zsh
# kf.sh <chapter> <tag> t1 t2 ... : render single frames at 1080p into film/out/kf/<chapter>-<tag>-<t>.png, then a 2-column montage
ch=$1; tag=$2; shift 2
cd "$(dirname "$0")/../scenes"
mkdir -p ../out/kf
for t in "$@"; do
  d=../out/kf/tmp-$ch-$t; node tools/render.js $ch/scene.html $ch/beats.json $d --from $t --to $t --fps 60 --workers 1 >/dev/null 2>&1 || node tools/render.js $ch/scene.html $ch/beats.json $d --from $t --to $t --fps 60 --workers 1 2>&1 | tail -3
  mv $d/*.png ../out/kf/$ch-$tag-$t.png; rmdir $d
done
# montage of the frames just rendered (2x2 or 2x1), half size each
files=(); for t in "$@"; do files+=(-i ../out/kf/$ch-$tag-$t.png); done
n=$#
if [ $n -ge 4 ]; then lay="0_0|w0_0|0_h0|w0_h0"; k=4; else lay="0_0|w0_0"; k=2; fi
ffmpeg -y -loglevel error ${files[@]:0:$((2*k))} -filter_complex "xstack=inputs=${k}:layout=${lay},scale=1920:-1" ../out/kf/M-$ch-$tag.png
