import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import * as pug from '../pug-interfaces';
import {createTextNode, stripQuotes} from './utils';
const walk = require('pug-walk');

export class TransformAnchorsProcessor implements Processor {
  name = 'transformAnchorsProcessor';
  $before = ['renderASTProcessor'];

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        walk(doc.ast, (node: pug.Node, replace: Function) => {
          if (node.type === 'Tag') {
            const tagNode = node as pug.Tag;
            // Only interested in anchors with exactly the `id` attribute
            if (tagNode.name === 'a' && tagNode.attrs.length === 1 && tagNode.attrs[0].name === 'id') {
              const id = stripQuotes(tagNode.attrs[0].val);
              replace(createTextNode(node, `\n\n{@a ${id}}\n`));
            }
          }
        });
      }
    });
  }
}
