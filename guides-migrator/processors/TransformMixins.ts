import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {join} from 'canonical-path';
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
            const extras = mixinNode.attrs.reduce((extras, attr) => Object.assign(extras, {[attr.name]: stripQuotes(attr.val)}), {});
            if (mixinNode.call && replacer) {
              replacer(doc, mixinNode, params, extras, replace);
            }
          }
        });
      }
    });
  }
}

interface CodeAttributes {
  path: string;
  region?: string;
  title?: string;
  linenums?: string;
}

export const makeExample: MixinReplacer = (doc, node, params, extraParams, replace) => {
  const attributes: CodeAttributes = {
    path: `"${computeFilePath(params[0], doc.baseName)}"`,
  };

  if (params[1] && params[1] !== 'null') {
    attributes.region = `"${stripQuotes(params[1])}"`;
  }

  const format = extraParams['format'];
  if (format) {
    if (format === '.') {
      attributes.linenums = '"false"';
    } else {
      const [key, value] = format.split(':');
      if (key === 'linenums') {
        attributes.linenums = `"${value}"`;
      }
    }
  }

  replace([
    createTextNode(node, '\n'), // need an empty line before the HTML begins for the markdown parser
    createTagNode(node, 'code-example', attributes as any, [])
  ]);
};

export const makeTabs: MixinReplacer = (doc, node, params, extraParams, replace) => {
  const files = parseInnerParams(stripQuotes(params[0]));
  const regions = parseInnerParams(stripQuotes(params[1]));
  const titles = parseInnerParams(stripQuotes(params[2]));
  const tabNodes = files.map((file, index) => {
    const attributes: CodeAttributes = {
      title: `"${titles[index] || computeTitle(file)}"`,
      path: `"${computeFilePath(file, doc.baseName)}"`
    };
    if (regions[index] && regions[index] !== 'null') {
      attributes.region = `"${regions[index]}"`;
    }
    return createTagNode(node, 'code-pane', attributes as any, []);
  });
  replace([
    createTextNode(node, '\n'), // need an empty line before the HTML begins for the markdown parser
    createTagNode(node, 'code-tabs', {}, tabNodes)
  ]);
};

export const makeExcerpt: MixinReplacer = (doc, node, params, extraParams, replace) => {
  const matches = params[0].match(/(.*?)(?:\s+\(([^\)]*)\))?$/);

  const examplePath = matches[1];
  const parenthesis = matches[2];
  const region = (params[1] && params[1] !== 'null') ? stripQuotes(params[1]) : parenthesis;

  const attributes: CodeAttributes = {
    path: `"${computeFilePath(examplePath, doc.baseName)}"`,
    linenums: '"false"',
    title: `"${computeTitle(examplePath)} (${parenthesis || region || 'excerpt'})"`
  };

  if (region) {
    attributes.region = `"${region}"`;
  }

  replace([
    createTextNode(node, '\n'), // need an empty line before the HTML begins for the markdown parser
    createTagNode(node, 'code-example', attributes as any, [])
  ]);
};


const PATH_TRANSFORM_EXCEPTIONS = [/cb-ts-to-js\/(js|ts)/];

// COPIED FROM ANGULAR.IO JADE UTILS (SORT OF)

// Converts the given project-relative path (like 'app/main.ts')
// to a doc folder relative path (like 'quickstart/ts/app/main.ts')
// by prefixing it with '<example-name>/'.
function computeFilePath(filePath, exampleName) {
  filePath = stripQuotes(filePath);
  if (isProjRelDir(filePath, exampleName)) {
    filePath = join(exampleName, filePath);
  }
  if (PATH_TRANSFORM_EXCEPTIONS.some(pattern => pattern.test(filePath))) {
    return filePath;
  } else {
    return filePath.replace(/\/(js|ts|dart)\//, '/');
  }
}

// Title is not given so use the filePath, removing any '.1' or '_1' qualifier on the end
function computeTitle(filePath) {
  const matches = filePath.match(/^(.*)[\._]\d(\.\w+)$/);
  return matches ? matches[1] + matches[2] : filePath;
}

// Returns truthy iff path is example project relative.
function isProjRelDir(path, baseName) {
  return path.indexOf(baseName) !== 0 &&
         !path.match(/\/(js|ts|dart)(-snippets|-es6(-decorators)?)?\//) &&
         !path.endsWith('e2e-spec.ts');
  // Last conjunct handles case for shared project e2e test file like
  // cb-component-communication/e2e-spec.js (is shared between ts & dart)
  // TODO: generalize: compare start with getExampleName(); which needs to be fixed.
}

