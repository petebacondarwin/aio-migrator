import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {writeFileSync} from 'fs';
import {resolve, dirname} from 'path';
const {sync: mkdirp} = require('mkdirp');

export class WriteFilesProcessor implements Processor {
  name = 'writeFilesProcessor';
  outputFolder: string;
  $after = ['renderASTProcessor'];

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        const outputPath = resolve(this.outputFolder, doc.relativePath.replace('.jade', '.md'));
        mkdirp(dirname(outputPath));
        let renderedContents = '';
        if (doc.title) {
          renderedContents += '@title\n' + doc.title + '\n\n';
        }
        if (doc.intro) {
          renderedContents += '@intro\n' + doc.intro + '\n\n';
        }
        if (doc.renderedAST) {
          renderedContents += '@description\n' + doc.renderedAST;
        }
        writeFileSync(outputPath, renderedContents, 'utf8');
      }
    });
  }
}