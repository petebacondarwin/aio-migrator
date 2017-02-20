import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import * as pug from '../pug-interfaces';
const walk = require('pug-walk');

export class RenderASTProcessor implements Processor {
  name = 'renderASTProcessor';

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        doc.renderedAST = renderAST(doc);
      }
    });
  }
}

function renderAST(doc: PugDocument) {
  let output = [];
  let indent = 0;
  walk(doc.ast, (node: pug.Node, replace: Function) => {
    switch (node.type) {
      case 'Block':
        break;
      case 'Text':
        const textNode = node as pug.Text;
        const lines = (textNode.val || '').split('\n').map(line => makeIndent(indent) + line);
        output.push(lines.join('\n'));
        break;
      case 'Tag':
        const tagNode = node as pug.Tag;
        if (!tagNode.isInline) { output.push('\n'); }
        output.push(`${makeIndent(indent)}<${tagNode.name}`);
        tagNode.attrs.forEach((attr: pug.Attribute) => {
          output.push(` ${attr.name}=${attr.val}`);
        });
        output.push(tagNode.selfClosing ? '/>' : '>');
        if (!tagNode.isInline) {
          output.push('\n');
          indent += 2;
        }
        break;
      case 'Code':
        const codeNode = node as pug.Code;
      case 'Filter':
        const filterNode = node as pug.Filter;
      default:
        // if we don't recognize it then delete the children
        replace([]);
        break;
    }
  }, (node: pug.Node) => {
    switch (node.type) {
      case 'Tag':
        const tagNode = node as pug.Tag;
        if (!tagNode.isInline) {
          indent -= 2;
          output.push('\n');
        }
        if (!tagNode.selfClosing) {
          output.push(`${makeIndent(indent)}</${tagNode.name}>`);
        }
        if (!tagNode.isInline) {
          output.push('\n\n');
        }
      case 'Code':
        const codeNode = node as pug.Code;
      default:
        break;
    }
  });
  return output.join('');
}

function makeIndent(indentation: number) {
  const space = ' ' as any;
  return space.repeat(indentation);
}