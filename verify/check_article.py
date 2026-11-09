#!/usr/bin/env python3
"""Check the article's references, required disclosure and evidence-bound values.

This is an editorial consistency check, not mathematical or Lean verification.
It reads both the article and the saved calculation/source records.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile

import sympy as sp


def check(root, proof_root=None):
    root = Path(root)
    proof_root = Path(proof_root) if proof_root else root / 'refs/NavierStokesAndEuler'
    article = root / 'article'
    required = ['exposition.md', 'CLAIMS.md', 'SOURCES.md', 'refs.bib',
                'figures/FIGURES.md']
    for name in required:
        assert (article / name).is_file(), f'missing_artifact: {name}'
    prose = (article / 'exposition.md').read_text()
    sources = (article / 'SOURCES.md').read_text()
    claims = (article / 'CLAIMS.md').read_text()
    figures = (article / 'figures/FIGURES.md').read_text()
    bib = (article / 'refs.bib').read_text()
    evidence = article / 'evidence'
    manifest = json.loads((evidence / 'MANIFEST.json').read_text())
    members = {item['path']: item for item in manifest['files']}
    actual_members = {str(p.relative_to(evidence)) for p in evidence.rglob('*')
                      if p.is_file() and p.name != 'MANIFEST.json'}
    assert members.keys() == actual_members, 'evidence_inventory'
    for name in ['README.md', 'verify/check_identities.py', 'verify/identities.json',
                 'verify/source_audit.py', 'verify/source-audit.json',
                 'verify/acceptance.json', 'verify/identities-negative.log',
                 'verify/source-audit-selftest.log', 'verify/environment.json',
                 'verify/lean-environment.log', 'verify/manuscript-versions.json']:
        assert name in members, f'missing_evidence_record: {name}'
    for name, item in members.items():
        data = (evidence / name).read_bytes()
        assert len(data) == item['bytes'] and hashlib.sha256(data).hexdigest() == item['sha256'], \
            f'evidence_digest: {name}'
    for name in ['source-audit.json', 'identities.json']:
        assert (evidence / 'verify' / name).read_bytes() == (root / 'verify' / name).read_bytes(), \
            f'evidence_original_output: {name}'
    audit = json.loads((root / 'verify/source-audit.json').read_text())
    keys = re.findall(r'^@\w+\{([^,]+),', bib, re.M)
    assert len(keys) == len(set(keys)), 'duplicate_bibliography_key'
    citations = set(re.findall(r'@([A-Za-z][A-Za-z0-9]*)', prose))
    assert citations <= set(keys), f'unknown_citation: {citations - set(keys)}'
    assert set(keys) <= citations, f'uncited_bibliography_entry: {set(keys) - citations}'
    for key in citations:
        assert key in sources, f'missing_source_locator: {key}'
        assert key in claims, f'missing_claim_source: {key}'
    for target in re.findall(r'\burl\s*=\s*\{([^}]+)\}', bib):
        if not target.startswith(('https://', 'http://')):
            assert (article / target).is_file(), f'broken_bibliography_link: {target}'
    assert re.search(r'^author: "Yao Xu"$', prose, re.M), 'author_line'
    assert prose.rstrip().splitlines()[-1] == 'Prepared by Yao Xu with AI assistance.', \
        'final_disclosure'
    for p in article.rglob('*'):
        if p.is_file() and 'build' not in p.relative_to(article).parts and p.suffix in ('.md', '.bib', '.svg', '.py', '.js', '.html', '.lua', '.yaml', '.sh', '.json', '.log', '.lean', '.jsonl', '.diff'):
            data = p.read_text()
            assert not re.search(r'/Users/|/home/|file://|\bworkspace\b',
                                 data, re.I), f'private_context: {p.name}'
            for label, target in re.findall(r'\[([^\]]*)\]\(([^)]+)\)', data):
                if target.startswith(('https://', 'http://', '#')):
                    continue
                assert (p.parent / target.split('#')[0]).is_file(), \
                    f'broken_relative_link: {p.name}: {target}'
            for revision, relative, start, end in re.findall(
                    r'https://github\.com/openai/NavierStokesAndEuler/blob/'
                    r'([a-f0-9]{40})/([^\s)\}#]+)(?:#L(\d+)-L(\d+))?', data):
                assert revision == audit['commit'], f'fixed_source_revision: {relative}'
                source = proof_root / relative
                assert source.is_file(), f'fixed_source_link: {relative}'
                if end:
                    assert 1 <= int(start) <= int(end) <= len(source.read_text().splitlines()), \
                        f'fixed_source_anchor: {relative}'
    tags = [int(n) for n in re.findall(r'\\tag\{(\d+)\}', prose)]
    assert tags == list(range(1, len(tags) + 1)), 'equation_number_sequence'
    callouts = re.findall(r'\*\*Figure (\d+) ', prose)
    specs = re.findall(r'^## Figure (\d+):', figures, re.M)
    assert callouts == specs, 'figure_spec_correspondence'

    cone = next(c for c in audit['cones'] if c['root'] == 'NavierStokes.ComparatorSolution')
    flattened = ' '.join(prose.split())
    match = re.search(r'([\d,]+) project modules and ([\d,]+) lines', flattened)
    assert match, 'missing_audit_values'
    values = [int(s.replace(',', '')) for s in match.groups()]
    assert values == [cone['project_module_count'], cone['project_source_lines']], 'audit_values'
    commit = re.search(r'`([a-f0-9]{40})`', prose).group(1)
    assert commit == audit['commit'], 'formal_revision'
    identities = {item['name']: item['value'] for item in
                  json.loads((root / 'verify/identities.json').read_text())['checks']}
    patterns = {
        'core_volume_exponent': r'\\text\{core volume\}.*?\\tau\^\{([^}]+)\}',
        'core_energy_exponent': r'\\text\{core energy\}.*?\\tau\^\{([^}]+)\}',
        'radial_dissipation_exponent': r'\\int_\{\\mathrm\{core\}\}.*?\\tau\^\{([^}]+)\}',
    }
    for key, pattern in patterns.items():
        m = re.search(pattern, prose, re.S)
        assert m, f'missing_scale_expression: {key}'
        expression = re.sub(r'(?<=\d)(?=[A-Za-z])', '*', m.group(1))
        assert sp.simplify(sp.sympify(expression) - sp.sympify(identities[key])) == 0, \
            f'scale_expression: {key}'
    return {'scope': 'editorial consistency only; no Lean execution',
            'citation_keys': len(citations), 'equations': len(tags),
            'figure_specs': len(specs), 'article_words': len(prose.split()),
            'evidence_package_files': len(members),
            'evidence_values': values, 'formal_revision': commit, 'passed': True}


def self_test(root):
    """Corrupt copied artifacts, and require the corresponding named failure."""
    mutations = [
        ('unknown_citation', lambda s: s + '\n[@MissingSource999]\n'),
        ('audit_values', lambda s: re.sub(r'([\d,]+)( project modules and)', r'1\2', s)),
        ('scale_expression: core_energy_exponent',
         lambda s: s.replace(r'\tau^{1/2-3h}', r'\tau^{1/2-2h}')),
        ('final_disclosure', lambda s: s.replace('Prepared by Yao Xu with AI assistance.', '')),
        ('evidence_digest: verify/identities.json', None),
        ('broken_bibliography_link: evidence/missing.md', None),
    ]
    for expected, mutate in mutations:
        # Keep all disposable copies inside the authorized directory.
        with tempfile.TemporaryDirectory(prefix='article-control-', dir=Path(root) / 'verify') as d:
            copy = Path(d)
            shutil.copytree(Path(root) / 'article', copy / 'article')
            (copy / 'verify').mkdir()
            for name in ['source-audit.json', 'identities.json']:
                shutil.copyfile(Path(root) / 'verify' / name, copy / 'verify' / name)
            p = copy / 'article/exposition.md'
            if mutate:
                p.write_text(mutate(p.read_text()))
            elif expected.startswith('evidence_digest'):
                record = copy / 'article/evidence/verify/identities.json'
                record.write_text(record.read_text() + '\n')
            else:
                bibliography = copy / 'article/refs.bib'
                bibliography.write_text(bibliography.read_text().replace(
                    'url = {evidence/README.md}', 'url = {evidence/missing.md}'))
            try:
                check(copy, Path(root) / 'refs/NavierStokesAndEuler')
            except AssertionError as error:
                assert str(error).startswith(expected), (expected, str(error))
                print(f'PASS negative control: {expected}')
            else:
                raise AssertionError(f'negative_control_not_rejected: {expected}')
    with tempfile.TemporaryDirectory(prefix='article-control-', dir=Path(root) / 'verify') as d:
        copy = Path(d)
        shutil.copytree(Path(root) / 'article', copy / 'article')
        (copy / 'verify').mkdir()
        for name in ['source-audit.json', 'identities.json']:
            shutil.copyfile(Path(root) / 'verify' / name, copy / 'verify' / name)
        p = copy / 'article/SOURCES.md'
        p.write_text(p.read_text() + '\n[broken source anchor]('
                     'https://github.com/openai/NavierStokesAndEuler/blob/'
                     'f9e8bc5b38b6e212696e8a30e3e91517af887bbd/'
                     'NavierStokes/R3/PressureFlux.lean#L1-L99999)\n')
        try:
            check(copy, Path(root) / 'refs/NavierStokesAndEuler')
        except AssertionError as error:
            assert str(error).startswith('fixed_source_anchor'), str(error)
            print('PASS negative control: fixed_source_anchor')
        else:
            raise AssertionError('negative_control_not_rejected: fixed_source_anchor')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test(args.root)
    else:
        print(json.dumps(check(args.root), indent=2))
