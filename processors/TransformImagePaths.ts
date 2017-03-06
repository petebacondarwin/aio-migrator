import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';

export class TransformImagePathsProcessor implements Processor {
  name = 'transformImagePathsProcessor';

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.renderedAST) {
        doc.renderedAST = doc.renderedAST.replace(/\/resources\/images\//g, 'assets/images/');
      }
    });
  }
};