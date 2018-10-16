const path = require('path');
const { cp, sed } = require('shelljs');

const projectDir = path.resolve(__dirname, '..');

cp('-R', `${projectDir}/dist/examples`, projectDir);
cp(`${projectDir}/dist/playground.min.js`, `${projectDir}/examples/`);

sed(
  '-i',
  '../playground.js',
  './playground.min.js',
  `${projectDir}/examples/index.html`
);
