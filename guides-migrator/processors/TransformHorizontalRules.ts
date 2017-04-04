import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import * as pug from '../pug-interfaces';
import {collectClasses, createTextNode} from './utils';
const walk = require('pug-walk');

export class TransformHorizontalRuleProcessor implements Processor {
  name = 'transformHorizontalRuleProcessor';
  $before = ['renderASTProcessor'];

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        walk(doc.ast, (node: pug.Node, replace: Function) => {
          if (node.type === 'Tag') {
            const tagNode = node as pug.Tag;
            const cssClasses = collectClasses(tagNode);
            if (cssClasses['l-hr']) {
              delete cssClasses['l-hr'];
              let classString = Object.keys(cssClasses).join(' ');
              if (classString.length) {
                classString =  ` class="${classString}"`;
              }
              replace([
                createTextNode(node, `\n\n<hr${classString}/>\n\n`),
              ]);
            }
          }
        });
      }
    });
  }
}
