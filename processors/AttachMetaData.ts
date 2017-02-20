import {DocCollection, Processor} from 'dgeni';
import {PugDocument, Document, DataDocument} from '../Document';
import * as pug from '../pug-interfaces';
import {join, dirname} from 'path';
const walk = require('pug-walk');

export class AttachMetaDataProcessor implements Processor {
  name = 'attachMetaDataProcessor';

  $process(docs: DocCollection) {
    const data = {};
    docs
      .filter((doc: Document) => doc.docType === 'data-document')
      .forEach((doc: DataDocument) => {
        const folderName = dirname(doc.relativePath);
        Object.keys(doc.data).forEach(fileName => {
          const docPath = join(folderName, fileName + '.jade');
          data[docPath] = doc.data[fileName];
        });
      });

    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        const docData = data[doc.relativePath];
        if (docData) {
          doc.title = docData.title;
          doc.intro = docData.intro;
        }
      }
    });
  }
}

