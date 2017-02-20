import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {writeFileSync} from 'fs';
import {resolve, dirname} from 'path';
const {sync: mkdirp} = require('mkdirp');

export class WriteFilesProcessor implements Processor {
  name = 'writeFilesProcessor';
  outputFolder: string;
  $after = ['renderContentsProcessor'];

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      const outputPath = resolve(this.outputFolder, doc.relativePath.replace('.jade', '.md'));
      mkdirp(dirname(outputPath));
      writeFileSync(outputPath, doc.renderedContent, 'utf8');
    });
  }
}