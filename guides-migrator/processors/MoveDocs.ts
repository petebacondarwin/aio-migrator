import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {resolve, dirname, join} from 'canonical-path';

export class MoveDocsProcessor implements Processor {
  name = 'moveDocsProcessor';
  outputFolder: string;

  $process(docs: DocCollection) {
    // Filter out the glossary from the guide
    docs = docs.filter((doc: PugDocument) => doc.relativePath !== 'guide/glossary.jade');

    docs.forEach((doc: PugDocument) => {
      if (doc.docType === 'pug-document') {

        // Move the cookbooks into the guide
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

        // Move the quickstarts and the glossary from the root to the guide
        if (
          /^(cli-)?quickstart\.jade$/.test(doc.relativePath) ||
          /^glossary\.jade$/.test(doc.relativePath)
        ) {
          doc.relativePath = join('guide', doc.relativePath);
        }
     }
    });

    return docs;
  }
}