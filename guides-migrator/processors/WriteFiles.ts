import {DocCollection, Processor} from 'dgeni';
import {PugDocument, ContentDocument} from '../Document';
import {writeFileSync} from 'fs';
import {resolve, dirname} from 'path';
const {sync: mkdirp} = require('mkdirp');

export class WriteFilesProcessor implements Processor {
  name = 'writeFilesProcessor';
  outputFolder: string;
  $after = ['renderASTProcessor'];

  $process(docs: DocCollection) {
    docs.forEach((doc: Document) => {
      if (doc instanceof ContentDocument) {
        const outputPath = resolve(this.outputFolder, doc.relativePath.replace(/\.(jade|html)$/, '.md'));
        mkdirp(dirname(outputPath));
        let renderedContents = '';
        if (doc.title) {
          renderedContents += '@title\n' + doc.title + '\n\n';
        }
        if (doc.intro) {
          renderedContents += '@intro\n' + doc.intro + '\n\n';
        }
        if (doc instanceof PugDocument) {
          renderedContents += '@description\n' + doc.renderedAST;
        } else {
          renderedContents += '@description\n' + doc.contents;
        }
        writeFileSync(outputPath, renderedContents, 'utf8');
      }
    });
  }
}