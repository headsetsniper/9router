const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const sourceHash = '19b7bc041374cab7091bdb3f944ccf276f014bb3c85a1ba440e6ab01eac49522';
const patches = [
  ['id:IC(l),provider:l.vendor,modelId:l.id,', 'id:IC(l),provider:l.vendor,modelId:`${l.vendor}/${IC(l)}`,wireModel:l.id,'],
  ['let Ee=it===void 0||COe(it.id),', 'let Ee=it===void 0||COe(it.id)||Mke(N?.id??""),'],
];

function patch(source) {
  for (const [before, after] of patches) {
    assert.equal(source.split(before).length - 1, 1, 'Expected exactly one patch anchor');
    source = source.replace(before, after);
  }
  return source;
}

if (process.argv[2] === '--self-test') {
  const fixture = patches.map(([before]) => before).join('\n');
  assert.equal(patch(fixture), patches.map(([, after]) => after).join('\n'));
  assert.throws(() => patch('unsupported bundle'));
  assert.throws(() => patch(fixture + '\n' + fixture));
  assert.throws(() => patch(patch(fixture)));
  console.log('PASS: behavior identity, wire model, search eligibility, missing/duplicate/already-patched guards');
} else {
  const [, , input, output] = process.argv;
  assert(input && output && process.argv.length === 4, 'Usage: node scripts\\prototype-byok-tool-search.cjs INPUT_BUNDLE NEW_OUTPUT_FILE | --self-test');
  const bytes = fs.readFileSync(input);
  // ponytail: pinned VS Code 1.147.0 bundle only; revalidate anchors and SDK behavior for newer builds.
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), sourceHash, 'Unsupported VS Code bundle; refusing patch');
  fs.writeFileSync(output, patch(bytes.toString('utf8')), { flag: 'wx' });
  console.log('Wrote prototype bundle; input unchanged. Never deploy into an active installation.');
}
