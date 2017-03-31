import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import * as pug from '../pug-interfaces';
import {collectClasses, createTextNode} from './utils';
const walk = require('pug-walk');

export class ExtractFilterContentsProcessor implements Processor {
  name = 'extractFilterContentsProcessor';
  $before = ['renderASTProcessor'];

  constructor(public matchFilters: string[]) {}

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        walk(doc.ast, (node: pug.Node, replace: Function) => {
          if (node.type === 'Filter') {
            const filterNode = node as pug.Filter;
            if (this.matchFilters.some(filter => filter === filterNode.name)) {
              replace([
                createTextNode(node, '\n\n'),
                ...filterNode.block.nodes,
              ]);
            }
          }
        });
      }
    });
  }
}
