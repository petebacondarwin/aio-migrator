const fs = require('fs-extra');
const globby = require('globby');
const ignore = require('ignore');
const path = require('path');
const shell = require('shelljs');

const NEW_EXAMPLES_PATH = path.join(__dirname, '/../../angular/aio/content/examples');
const OLD_EXAMPLES_PATH = path.join(__dirname, '/../../angular.io/public/docs/_examples');

const EXAMPLES_TO_PROCESS = [
  '**'
];

const SPECIAL_EXAMPLES = [
  'cb-ts-to-js',
  '_boilerplate'
];

const EXAMPLES_TO_IGNORE = [
  `homepage-*`
];

console.log(`Deleting examples from ${NEW_EXAMPLES_PATH}...`);
shell.rm('-rf', NEW_EXAMPLES_PATH);


const globPatterns = [
  ...EXAMPLES_TO_PROCESS,
  ...EXAMPLES_TO_IGNORE.map(e => `!${e}`)
];

console.log('Reading example files from the following glob patterns', globPatterns);
// Get a list of all the files that match our glob patterns, filtering out folders
let examplePaths = globby.sync(globPatterns, { cwd: OLD_EXAMPLES_PATH, mark: true, dot: true }).filter(filePath => !/\/$/.test(filePath));
console.log(`Found ${examplePaths.length} example files.`);

// Transform the paths to the example files
const pathMap = {};
examplePaths = examplePaths.map(oldPath => {
  // remove the ts folder unless it is special example path
  const newPath = SPECIAL_EXAMPLES.some(special => oldPath.indexOf(special) === 0) ? oldPath : oldPath.replace(/\/ts\//, '/');
  pathMap[newPath] = oldPath;
  return newPath;
});

// Filter files that would be ignored by our `.gitignore` file
const gitignore = ignore().add(fs.readFileSync(path.resolve(__dirname, 'gitignore'), 'utf8'));
examplePaths = gitignore.filter(examplePaths);
console.log(`Ignoring patterns that match .gitignore rules leaving ${examplePaths.length} example files.`);

console.log('Copying example files');
examplePaths.forEach(newPath => {
  fs.ensureDirSync(path.resolve(NEW_EXAMPLES_PATH, path.dirname(newPath)));
  fs.copySync(path.resolve(OLD_EXAMPLES_PATH, pathMap[newPath]), path.resolve(NEW_EXAMPLES_PATH, newPath));
});

// Copy our custom gitignore and replace the other one
console.log('Replacing the .gitignore with our new one.')
const gitignoreFile = fs.readFileSync(path.join(__dirname, 'gitignore'));
fs.writeFileSync(path.join(NEW_EXAMPLES_PATH, '.gitignore'), gitignoreFile);
