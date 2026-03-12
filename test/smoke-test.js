// Simple backend smoke test
const pkg = require('../package.json');

if (!pkg.name || !pkg.version) {
  console.error('Backend smoke test failed: package.json is missing name or version');
  process.exit(1);
}

console.log(`Backend smoke test passed for ${pkg.name}@${pkg.version}`);
