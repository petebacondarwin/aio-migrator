import {DocCollection, Processor} from 'dgeni';
import {ContentDocument, Document, DataDocument} from '../Document';
import {join, dirname} from 'canonical-path';

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

    docs.forEach((doc: ContentDocument) => {
      if (doc instanceof ContentDocument) {
        // Get the data for this doc (or if it is not a jade doc the related jade doc)
        const docData = data[doc.relativePath] || data[doc.relativePath.replace(/\.(html|md)$/, '.jade')];
        if (docData) {
          doc.title = docData.title;
          doc.intro = docData.intro;
        }
      }
    });
  }
}

