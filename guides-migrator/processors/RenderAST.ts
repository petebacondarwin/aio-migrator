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
  let ancestors: pug.Node[] = [];
  walk(doc.ast, (node: pug.Node, replace: Function) => {
    switch (node.type) {
      case 'Block':
        break;
      case 'Text':
        const textNode = node as pug.Text;
        // Only add indent if the line not blank and is not a descendent of an inline tag
        if (textNode.val.trim() !== '' && ancestors.every(ancestor => !(ancestor as any).isInline)) {
          push(makeIndent(indent));
        }
        push(textNode.val);
        break;
      case 'Tag':
        const tagNode = node as pug.Tag;
        if (!tagNode.isInline) {
          push('\n');
          if (ancestors.every(ancestor => ancestor.type !== 'Tag')) {
            // we are entering an HTML tag that is not already a descendent of a tag, so we must add
            // an additional newline to prevent the markdown from being invalid
            push('\n');
          }
        }
        push(`${makeIndent(indent)}<${tagNode.name}`);
        tagNode.attrs.forEach((attr: pug.Attribute) => {
          push(` ${attr.name}=${attr.val}`);
        });
        if (tagNode.selfClosing) {
          push('/>');
          if (ancestors.every(ancestor => ancestor.type !== 'Tag')) {
            // we are leaving a self closing HTML tag that is not already a descendent of a tag, so we
            // must add an additional newline to prevent the markdown from being invalid
            push('\n');
          }
        } else {
          push('>');
          if (!tagNode.isInline) {
            push('\n');
            indent += 2;
          }
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
    if ((node as any).nodes || (node as any).block) {
      ancestors.push(node);
    }
  }, (node: pug.Node) => {
    if ((node as any).nodes || (node as any).block) {
      ancestors.pop();
    }
    switch (node.type) {
      case 'Tag':
        const tagNode = node as pug.Tag;
        if (!tagNode.isInline) {
          push('\n');
          indent -= 2;
          push(`${makeIndent(indent)}`);
        }
        if (!tagNode.selfClosing) {
          push(`</${tagNode.name}>`);
        }
        if (!tagNode.isInline) {
          push('\n');
          if (ancestors.every(ancestor => ancestor.type !== 'Tag')) {
            // we are leaving an HTML tag that is not already a descendent of a tag, so we must add
            // an additional newline to prevent the markdown from being invalid
            push('\n');
          }
        }
      case 'Code':
        const codeNode = node as pug.Code;
      default:
        break;
    }
  });
  function push(text) {
    output.push(text);
  }
  return output.join('');
}

function makeIndent(indentation: number) {
  const space = ' ' as any;
  return space.repeat(indentation);
}