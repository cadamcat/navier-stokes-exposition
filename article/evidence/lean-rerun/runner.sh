#!/bin/bash
# Lean check of openai/NavierStokesAndEuler at f9e8bc5 on a rented cloud Linux VM.
# Stage 1: toolchain, Mathlib cache, full build, axioms of the two comparator theorems (the deliverable).
# Stage 2 (best effort): the repository's Comparator challenges.
set -u
W=${RERUN_ROOT:?}/nslean; mkdir -p $W/out; cd $W
LOG=$W/out/runner.log; ST=$W/out/status.txt
say() { echo "$(date -u +%FT%TZ) $*" | tee -a $LOG; echo "$*" > $ST; }
say "start"; nproc >> $LOG; free -g >> $LOG; df -h ${RERUN_ROOT:?} >> $LOG
curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh | sh -s -- -y --default-toolchain none >> $LOG 2>&1
export PATH=$HOME/.elan/bin:$PATH
git clone -q https://github.com/openai/NavierStokesAndEuler.git repo >> $LOG 2>&1
cd repo && git checkout -q f9e8bc5b38b6e212696e8a30e3e91517af887bbd && git rev-parse HEAD | tee $W/out/commit.txt
cat lean-toolchain | tee $W/out/toolchain.txt
say "cache get"
( time lake exe cache get ) >> $W/out/cache.log 2>&1; echo "cache exit $?" >> $LOG
say "build"
( time lake build ) > $W/out/build.log 2>&1; B=$?; echo "build exit $B" | tee -a $LOG > $W/out/build.exit
tail -5 $W/out/build.log >> $LOG
say "axioms"
cat > /tmp/Axioms.lean <<'LEAN'
import NavierStokes.ComparatorSolution
#print axioms NavierStokes.Comparator.navier_stokes_breakdown_periodic
#print axioms NavierStokes.Comparator.navier_stokes_breakdown_R3
LEAN
( lake env lean /tmp/Axioms.lean ) > $W/out/axioms.log 2>&1; echo "axioms exit $?" | tee -a $LOG > $W/out/axioms.exit
cat $W/out/axioms.log >> $LOG
say "stage1 done (build exit $B)"
(cd $W && tar czf ${RERUN_ROOT:?}/nslean-stage1.tgz out && sha256sum ${RERUN_ROOT:?}/nslean-stage1.tgz > ${RERUN_ROOT:?}/nslean-stage1.tgz.sha256)
say "stage1 packed"
# Stage 2: Comparator (needs landrun, lean4export, nanoda_bin on PATH).
{
  set -x
  apt-get -qq update && apt-get -qq install -y golang-go cargo > /dev/null
  export GOPATH=$HOME/go PATH=$HOME/go/bin:$HOME/.cargo/bin:$PATH
  go install github.com/zouuup/landrun/cmd/landrun@latest
  curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal > /dev/null && . $HOME/.cargo/env
  rustc --version
  git clone -q https://github.com/ammkrn/nanoda_lib ${RERUN_ROOT:?}/nanoda_lib
  cd ${RERUN_ROOT:?}/nanoda_lib && git rev-parse HEAD && cargo build --release -q && export PATH=${RERUN_ROOT:?}/nanoda_lib/target/release:$PATH
  (cd ${RERUN_ROOT:?} && git clone -q https://github.com/zouuup/landrun lr && cd lr && git rev-parse HEAD)
  git clone -q https://github.com/leanprover/lean4export ${RERUN_ROOT:?}/lean4export
  cd ${RERUN_ROOT:?}/lean4export && git rev-parse HEAD && cp $W/repo/lean-toolchain . && lake build && mkdir -p $HOME/bin && ln -sf $PWD/.lake/build/bin/lean4export $HOME/bin/lean4export
  export PATH=$HOME/bin:$PATH
  which landrun lean4export nanoda_bin
  cd $W/repo && lake exe comparator ComparatorChallenges/NavierStokes.json
} > $W/out/comparator.log 2>&1
echo "comparator exit $?" | tee -a $LOG > $W/out/comparator.exit
cd $W && tar czf ${RERUN_ROOT:?}/nslean-out.tgz out && sha256sum ${RERUN_ROOT:?}/nslean-out.tgz > ${RERUN_ROOT:?}/nslean-out.tgz.sha256
say "done"
