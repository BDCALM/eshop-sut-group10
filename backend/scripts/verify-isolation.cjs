const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const temporaryRoot = path.resolve(tmpdir());
const reportDirectory = mkdtempSync(path.join(temporaryRoot, 'eshop-isolation-'));
const database = path.join(root, 'database.sqlite');
const hash = () => createHash('sha256').update(readFileSync(database)).digest('hex');
const before = hash();
let baseline;
let verificationFailed = false;
try {
  console.log('B-03: verify repeated runs and randomized test order');
  console.log(`Production database SHA256 before: ${before}`);
  for (const seed of [101, 202, 303]) {
    const report = path.join(reportDirectory, `${seed}.json`);
    const run = spawnSync(process.execPath, [require.resolve('jest/bin/jest'),
      '--runInBand', '--randomize', `--seed=${seed}`, '--showSeed', '--detectOpenHandles',
      '--json', `--outputFile=${report}`], { cwd: root, encoding: 'utf8' });
    if (run.error || ![0, 1].includes(run.status)) throw run.error || new Error(`Jest exited ${run.status}`);
    const result = JSON.parse(readFileSync(report, 'utf8'));
    const cases = result.testResults.flatMap(suite => suite.assertionResults);
    const signature = cases.map(test => `${test.fullName}: ${test.status}`).sort();
    const failures = cases.filter(test => test.status === 'failed').map(test => test.title.split(' ')[0]).sort();
    // B-02 has ten known SUT failures. This is a harness check, not a conversion
    // of the failing assertions into passing tests or a replacement CI gate.
    const expectedFailures = ['A-AUTH-03', 'A-ACCESS-02', 'A-COUPON-05', 'A-COUPON-07',
      'A-COUPON-09', 'A-CART-03', 'A-CHECKOUT-02', 'A-CHECKOUT-03', 'A-ORDER-03', 'A-ORDER-04'].sort();
    const stable = !baseline || JSON.stringify(signature) === JSON.stringify(baseline);
    const expected = result.numTotalTests === 39 && result.numPendingTests === 0 &&
      JSON.stringify(failures) === JSON.stringify(expectedFailures) &&
      result.openHandles.length === 0 && cases.every(test => ['passed', 'failed'].includes(test.status));
    console.log(`seed=${seed} tests=${result.numTotalTests} pass=${result.numPassedTests} fail=${result.numFailedTests} jestExit=${run.status} stable=${stable} expectedFailures=${expected} openHandles=${result.openHandles.length}`);
    if (!stable || !expected) {
      verificationFailed = true;
      console.error(run.stderr);
    }
    baseline = signature;
  }
} catch (error) {
  verificationFailed = true;
  console.error(error.message);
} finally {
  const after = hash();
  console.log(`Production database SHA256 after: ${after}`);
  if (after !== before) verificationFailed = true;
  // Only the unique temporary directory created by this script is removed.
  if (path.dirname(path.resolve(reportDirectory)) !== temporaryRoot ||
      !path.basename(reportDirectory).startsWith('eshop-isolation-')) {
    verificationFailed = true;
    console.error('Refusing to remove a directory outside the temporary report location');
  } else {
    rmSync(reportDirectory, { recursive: true, force: true });
  }
}
console.log(`B-03 isolation verification: ${verificationFailed ? 'FAIL' : 'PASS'}`);
process.exitCode = verificationFailed ? 1 : 0;
