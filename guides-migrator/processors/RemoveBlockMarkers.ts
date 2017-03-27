import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import * as pug from '../pug-interfaces';
import {collectClasses, createTextNode} from './utils';
const walk = require('pug-walk');

export class RemoveBlockMarkersProcessor implements Processor {
  name = 'removeBlockMarkersProcessor';
  $before = ['renderASTProcessor'];

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        walk(doc.ast, (node: pug.Node, replace: Function) => {
          if (node.type === 'NamedBlock') {
            const blockNode = node as pug.NamedBlock;
            replace([
              createTextNode(blockNode, '\n'),
              ...blockNode.nodes,
            ]);
          }
        });
      }
    });
  }
}
