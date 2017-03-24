import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import * as pug from '../pug-interfaces';
import {collectClasses, createTextNode} from './utils';
const walk = require('pug-walk');

export class RemoveDivsProcessor implements Processor {
  name = 'removeDivsProcessor';
  $before = ['renderASTProcessor'];

  constructor(public matchClasses: string[]) {}

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        walk(doc.ast, (node: pug.Node, replace: Function) => {
          if (node.type === 'Tag') {
            const tagNode = node as pug.Tag;
            const cssClasses = collectClasses(tagNode);
            if (this.matchClasses.some(cssClass => cssClasses[cssClass])) {
              replace([
                createTextNode(tagNode, '\n'),
                ...tagNode.block.nodes,
              ]);
            }
          }
        });
      }
    });
  }
}
