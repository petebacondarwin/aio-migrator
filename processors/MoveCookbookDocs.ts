import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {resolve, dirname} from 'path';

export class MoveCookbookDocsProcessor implements Processor {
  name = 'moveCookbookDocsProcessor';
  outputFolder: string;

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {
        const folder = dirname(doc.relativePath);
        if (/cookbook$/.test(folder)) {
          const newFolder = folder.replace(/cookbook$/, 'guide');
          let newPath = doc.relativePath.replace(folder, newFolder);

          // If the new cookbook file path collides with a guide already then prefix with cb-
          if (docs.find(d => d !== doc && d.relativePath === newPath)) {
            newPath = doc.relativePath.replace(folder + '/', newFolder + '/cb-');
          }
          doc.relativePath = newPath;
        }
     }
    });
  }
}