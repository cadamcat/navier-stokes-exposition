#!/usr/bin/env python3
"""Report project-source import closures and forbidden proof shortcuts.

This lexical audit is not a Lean elaboration, axiom audit, or kernel replay.
External imports are enumerated rather than claimed to have been audited.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

FORBIDDEN = re.compile(r"\b(sorry|sorryAx|admit|axiom|native_decide|implemented_by|extern|unsafe)\b")


def code_only(source):
    """Blank nested Lean comments and string contents, retaining line numbers."""
    result = list(source)
    i, depth, string = 0, 0, False
    while i < len(source):
        if depth:
            if source.startswith('/-', i):
                result[i:i+2] = '  '; depth += 1; i += 2
            elif source.startswith('-/', i):
                result[i:i+2] = '  '; depth -= 1; i += 2
            else:
                if source[i] != '\n': result[i] = ' '
                i += 1
        elif string:
            if source[i] == '\\' and i + 1 < len(source):
                result[i:i+2] = '  '; i += 2
            else:
                if source[i] == '"': string = False
                if source[i] != '\n': result[i] = ' '
                i += 1
        elif source.startswith('--', i):
            end = source.find('\n', i)
            if end == -1: end = len(source)
            result[i:end] = ' ' * (end-i); i = end
        elif source.startswith('/-', i):
            result[i:i+2] = '  '; depth = 1; i += 2
        elif source[i] == '"':
            result[i] = ' '; string = True; i += 1
        else:
            i += 1
    if depth or string:
        raise ValueError('Unterminated block comment or string')
    return ''.join(result)


def findings(source):
    code = code_only(source)
    return [{"token": m.group(), "line": code.count('\n', 0, m.start())+1}
            for m in FORBIDDEN.finditer(code)]


def closure(root, module):
    todo, seen, external, hits = [module], set(), set(), []
    while todo:
        name = todo.pop()
        if name in seen: continue
        path = root / (name.replace('.', '/') + '.lean')
        if not path.is_file():
            if name.startswith(('NavierStokes', 'ComparatorChallenges', 'Euler')):
                raise FileNotFoundError(path)
            external.add(name); continue
        seen.add(name)
        source = path.read_text()
        hits += [{"file": str(path.relative_to(root)), **hit} for hit in findings(source)]
        for line in code_only(source).splitlines():
            match = re.match(r'^\s*(?:public\s+)?import\s+(.+)$', line)
            if match: todo.extend(match[1].split())
    paths = [root / (name.replace('.', '/') + '.lean') for name in sorted(seen)]
    return {"root": module, "project_module_count": len(seen),
            "project_source_bytes": sum(p.stat().st_size for p in paths),
            "project_source_lines": sum(len(p.read_text().splitlines()) for p in paths),
            "modules": sorted(seen), "external_imports_not_audited": sorted(external),
            "forbidden_code_tokens": hits}


def self_test():
    import tempfile
    import shutil
    with tempfile.TemporaryDirectory(prefix='audit-negative-', dir=Path(__file__).parent) as directory:
        root = Path(directory)
        (root/'Good.lean').write_text('/- sorry /- axiom -/ -/\n-- admit\ndef s := "native_decide"\n')
        (root/'Bad.lean').write_text('import Good\ntheorem negative_sorry : True := by sorry\n')
        assert not closure(root, 'Good')['forbidden_code_tokens']
        bad = closure(root, 'Bad')['forbidden_code_tokens']
        assert bad == [{"file": "Bad.lean", "token": "sorry", "line": 2}], bad
        (root/'Bad.lean').write_text('axiom negative_axiom : False\n')
        assert closure(root, 'Bad')['forbidden_code_tokens'][0]['token'] == 'axiom'
        upstream = Path('refs/NavierStokesAndEuler')
        for relative in ['NavierStokes/ComparatorDefinitions.lean', 'ComparatorChallenges/NavierStokes.lean']:
            target = root/relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(upstream/relative,target)
        target = root/'NavierStokes/ComparatorDefinitions.lean'
        original = target.read_text()
        assert '(1 + ‖x‖ + t)' in original
        target.write_text(original.replace('(1 + ‖x‖ + t)', '(1 + ‖x‖)'))
        result = compare_statements(root)
        assert not result['comparator_reference_definitions_equal']['ForceConditionDecay']
    print('PASS comments_and_strings_ignored; negative_sorry_detected; negative_axiom_detected; negative_force_time_decay_omitted')


def compare_statements(root):
    """Compare definition bodies, not comments or notation wrappers."""
    comparator = code_only((root/'NavierStokes/ComparatorDefinitions.lean').read_text())
    start = comparator.index('def divergence')
    # The official challenge contains additional elementary divergence lemmas.
    names = ['divergence', 'IsOnePeriodic', 'InitialVelocityCondition',
             'InitialVelocityConditionDecay', 'InitialVelocityConditionPeriodic',
             'ForceCondition', 'ForceConditionDecay', 'ForceConditionPeriodic',
             'NavierStokesExistenceAndSmoothness', 'NavierStokesExistenceAndSmoothnessRn',
             'NavierStokesExistenceAndSmoothnessPeriodic']
    def declaration(code, name):
        match = re.search(r'(?m)^(?:def|structure) '+name+r'\b', code)
        if not match: raise ValueError(name)
        tail = code[match.start():]
        stop = re.search(r'\n(?:@|noncomputable\b|(?:def|structure|theorem|abbrev|end|local)\b)', tail)
        return ' '.join((tail[:stop.start()] if stop else tail).split())
    reference = code_only((root/'ComparatorChallenges/NavierStokes.lean').read_text())
    result = {"comparator_reference_definitions_equal": {
        name: declaration(comparator, name) == declaration(reference, name) for name in names}}
    targets = json.loads(Path('refs/mathdb-formalizations.json').read_text())
    result['mathdb'] = []
    for target in targets:
        source = target['source']
        code = code_only(source)
        equal = {name: declaration(comparator, name) == declaration(code, name) for name in names}
        result['mathdb'].append({"id": target['id'], "module": target['module_name'],
            "recorded_sha256": target['sha256'],
            "source_sha256_matches_record": hashlib.sha256(source.encode()).hexdigest() == target['sha256'],
            "definition_bodies_equal": equal,
            "target": ' '.join(code[code.index('abbrev Target'):].split())})
    result['formal_conjectures_definitions_equal'] = {
        name: declaration(comparator, name) == declaration(code_only(Path('refs/formal-conjectures-NavierStokes.lean').read_text()), name)
        for name in names}
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path('refs/NavierStokesAndEuler'))
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
        raise SystemExit(0)
    roots = ['NavierStokes.ComparatorTheorem', 'NavierStokes.ComparatorR3Theorem',
             'NavierStokes.ComparatorSolution']
    cones = [closure(args.root, name) for name in roots]
    report = {"scope": "lexical project import closure; not compiled or external dependency audit",
              "commit": subprocess.check_output(['git','-C',str(args.root),'rev-parse','HEAD'],text=True).strip(),
              "cones": cones, "statement_comparison": compare_statements(args.root),
              "all_project_lean_files": sum(1 for _ in args.root.rglob('*.lean')),
              "challenge_placeholders": findings((args.root/'ComparatorChallenges/NavierStokes.lean').read_text())}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    compare = report['statement_comparison']
    ok = not any(c['forbidden_code_tokens'] for c in cones)
    ok &= all(compare['comparator_reference_definitions_equal'].values())
    ok &= all(compare['formal_conjectures_definitions_equal'].values())
    ok &= all(t['source_sha256_matches_record'] and all(t['definition_bodies_equal'].values()) for t in compare['mathdb'])
    raise SystemExit(0 if ok else 1)
