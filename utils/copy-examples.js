const path = require('path');
const { cp, sed } = require('shelljs');

const projectDir = path.resolve(__dirname, '..');

cp('-R', `${projectDir}/dist/examples`, projectDir);
cp(`${projectDir}/dist/playground.min.js`, `${projectDir}/examples/`);

cp('-R', `${projectDir}/dist/incremental`, projectDir);
cp(`${projectDir}/dist/playground.min.js`, `${projectDir}/incremental/`);

sed(
  '-i',
  '../playground.js',
  './playground.min.js',
  `${projectDir}/examples/index.html`
);

sed(
  '-i',
  '../playground.js',
  './playground.min.js',
  `${projectDir}/incremental/index.html`
);
