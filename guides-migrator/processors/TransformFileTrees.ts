import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import * as pug from '../pug-interfaces';
import {collectClasses, createTextNode, createTagNode} from './utils';
const walk = require('pug-walk');

interface FileTreeNode {
  name: string;
  children?: FileTreeNode[];
}

export class TransformFileTreesProcessor implements Processor {
  name = 'transformFileTreesProcessor';
  $before = ['renderASTProcessor'];

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        walk(doc.ast, (node: pug.Node, replace: pug.ReplaceFunction) => {
          if (node.type === 'Tag') {
            const tagNode = node as pug.Tag;
            const cssClasses = collectClasses(tagNode);
            if (cssClasses['filetree']) {
              replace(createTagNode(tagNode, 'aio-filetree', {}, parseChildren(tagNode.block)));
            }
          }
        });
      }
    });
  }
}

function parseFile(block: pug.Block): pug.Tag {
  let name;
  let children;
  block.nodes.forEach(node => {
    switch (node.type) {
      case 'Text':
        name = (node as pug.Text).val;
        break;
      case 'Tag':
        const tag = node as pug.Tag;
        const cssClasses = collectClasses(tag);
        if (cssClasses['children']) {
          // We found children as the first child of a file so we will add them to the file and convert it to a folder
          children = parseChildren(tag.block);
        }
        break;
    }
  });
  return createTagNode(block, children ? 'aio-folder' : 'aio-file', {}, [ { type: 'Text', val: name }, ... children || [] ]);
}

function parseChildren(block: pug.Block): pug.Node[] {
  const children = [];
  let currentFile: pug.Tag;
  block.nodes.forEach(node => {
    if (node.type === 'Tag') {
      const tag = node as pug.Tag;
      const cssClasses = collectClasses(tag);
      if (cssClasses['file']) {
        currentFile = parseFile(tag.block);
        children.push(currentFile);
      } else if (cssClasses['children']) {
        // We found children after a file so we put those children inside the file and convert it to a folder
        currentFile.name = 'aio-folder';
        currentFile.block.nodes = [...currentFile.block.nodes, ...parseChildren(tag.block)];
      }
    }
  });
  return children;
}
