import {DocCollection, Processor} from 'dgeni';
import {Block} from '../pug-interfaces';
import {ContentDocument} from '../Document';

import {readFileSync} from 'fs';
import {resolve, relative, basename, extname} from 'canonical-path';
const glob = require('glob');

export class ReadContentFilesProcessor implements Processor {
  name = 'readContentFilesProcessor';
  sourcePattern: string;
  sourceBase: string;

  $process(docs: DocCollection) {
    const paths: string[] = glob.sync(resolve(this.sourceBase, this.sourcePattern));
    paths.forEach(filePath => {
      const contents = readFileSync(filePath, 'utf8');
      try {
        const baseName = basename(filePath, extname(filePath));
        const doc = new ContentDocument(filePath, relative(this.sourceBase, filePath), baseName, contents);
        docs.push(doc);
      } catch (e) {
        console.log('Failed to process', filePath, e);
      }
    });
  }
}
