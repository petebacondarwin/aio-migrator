import {DocCollection, Processor} from 'dgeni';
import * as pug from '../pug-interfaces';
import {PugDocument} from '../Document';
import {parseArgs, stripQuotes} from './utils';
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
