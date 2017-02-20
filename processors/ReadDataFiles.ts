import {DocCollection, Processor} from 'dgeni';
import {DataDocument} from '../Document';

import {resolve, relative} from 'path';
const glob = require('glob');

export class ReadDataFilesProcessor implements Processor {
  name = 'readDataFilesProcessor';
  sourcePattern: string;
  sourceBase: string;

  $process(docs: DocCollection) {
    const paths: string[] = glob.sync(resolve(this.sourceBase, this.sourcePattern));
    paths.forEach(filePath => {
      const data = require(filePath);
      try {
        const doc = new DataDocument(filePath, relative(this.sourceBase, filePath), data);
        docs.push(doc);
      } catch (e) {
        console.log('Failed to process', filePath, e);
      }
    });
  }
}
