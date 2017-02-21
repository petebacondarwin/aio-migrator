import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {parseParams, parseInnerParams, createTagNode, createTextNode} from './utils';
import * as pug from '../pug-interfaces';
const walk = require('pug-walk');

export interface MixinReplacer {
  (node: pug.Mixin, params: string[], extraParams: {[key: string]: string}, replace: pug.ReplaceFunction);
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

            const params = parseParams(mixinNode.args);
            const extras = mixinNode.attrs.reduce((extras, attr) => Object.assign(extras, {[attr.name]: attr.val}), {});

            if (mixinNode.call && replacer) {
              replacer(mixinNode, params, extras, replace);
            }
          }
        });
      }
    });
  }
}

export const makeExample = (node, params, extraParams, replace) => {
  const filePath = params[0];
  const region = params[1] ? ` region='${params[1]}'` : '';
  const lineNums = extraParams['format'] === '.' ? ` linenums='false'` : '';
  replace(createTextNode(node, `\n\n{@example '${filePath}'${region}${lineNums}}\n\n`));
};

export const makeTabs = (node, params, extraParams, replace) => {
  const files = parseInnerParams(params[0]);
  const regions = parseInnerParams(params[1]);
  const titles = parseInnerParams(params[2]);
  const tabNodes = files.map((file, index) => {
    const region = regions[index] ? ` region='${regions[index]}'` : '';
    const title = titles[index] || file;
    return createTagNode(node, 'md-tab', {label: `"${title}"`}, [createTextNode(node, `{@example '${file}'${region}}`)]);
  });
  replace(createTagNode(node, 'md-tab-group', {}, tabNodes));
};
