import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {parseArgs, parseInnerParams, createTagNode, createTextNode, stripQuotes} from './utils';
import * as pug from '../pug-interfaces';
const walk = require('pug-walk');

export interface MixinReplacer {
  (doc: PugDocument, node: pug.Mixin, params: string[], extraParams: {[key: string]: string}, replace: pug.ReplaceFunction);
}

export class TransformMixinsProcessor implements Processor {
  name = 'transformMixinsProcessor';
  $before = ['renderASTProcessor'];

  constructor(private mixinReplacers: { [mixinName: string]: MixinReplacer }) {}

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        walk(doc.ast, (node: pug.Node, replace: pug.ReplaceFunction) => {
          if (node.type === 'Mixin') {
            const mixinNode = node as pug.Mixin;
            let replacer = this.mixinReplacers[mixinNode.name];

            const params = parseArgs(mixinNode.args);
            const extras = mixinNode.attrs.reduce((extras, attr) => Object.assign(extras, {[attr.name]: attr.val}), {});

            if (mixinNode.call && replacer) {
              replacer(doc, mixinNode, params, extras, replace);
            }
          }
        });
      }
    });
  }
}

export const makeExample: MixinReplacer = (doc, node, params, extraParams, replace) => {
  let filePath = computeFilePath(params[0], doc.baseName);
  console.log(filePath)
  const region = (params[1] && params[1] !== 'null') ? ` region='${stripQuotes(params[1])}'` : '';
  const lineNums = extraParams['format'] === '.' ? ` linenums='false'` : '';
  replace(createTextNode(node, `\n\n{@example '${filePath}'${region}${lineNums}}\n\n`));
};

export const makeTabs: MixinReplacer = (doc, node, params, extraParams, replace) => {
  const files = parseInnerParams(stripQuotes(params[0]));
  const regions = parseInnerParams(stripQuotes(params[1]));
  const titles = parseInnerParams(stripQuotes(params[2]));
  const tabNodes = files.map((file, index) => {
    file = computeFilePath(file, doc.baseName);
    const region = (regions[index] && regions[index] !== 'null') ? ` region='${regions[index]}'` : '';
    const title = titles[index] || computeTitle(file);
    return createTagNode(node, 'md-tab', {label: `"${title}"`}, [createTextNode(node, `{@example '${file}'${region}}`)]);
  });
  replace(createTagNode(node, 'md-tab-group', {}, tabNodes));
};


// COPIED FROM ANGULAR.IO JADE UTILS (SORT OF)

// Converts the given project-relative path (like 'app/main.ts')
// to a doc folder relative path (like 'quickstart/ts/app/main.ts')
// by prefixing it with '<example-name>/'.
function computeFilePath(filePath, exampleName) {
  filePath = stripQuotes(filePath);
  if (isProjRelDir(filePath, exampleName)) {
    filePath = exampleName + filePath;
  }
  return filePath.replace(/\/(js|ts|dart)(-snippets)?\//, '/');
}

// Title is not given so use the filePath, removing any '.1' or '_1' qualifier on the end
function computeTitle(filePath) {
  const matches = filePath.match(/^(.*)[\._]\d(\.\w+)$/);
  return matches ? matches[1] + matches[2] : filePath;
}

// Returns truthy iff path is example project relative.
function isProjRelDir(path, baseName) {
  return path.indexOf(baseName) !== 0 &&
         !path.match(/\/(js|ts|dart)(-snippets)?\//) &&
         !path.endsWith('e2e-spec.ts');
  // Last conjunct handles case for shared project e2e test file like
  // cb-component-communication/e2e-spec.js (is shared between ts & dart)
  // TODO: generalize: compare start with getExampleName(); which needs to be fixed.
}

