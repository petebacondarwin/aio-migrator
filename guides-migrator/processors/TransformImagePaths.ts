import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';

export class TransformImagePathsProcessor implements Processor {
  name = 'transformImagePathsProcessor';

  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.renderedAST) {
        doc.renderedAST = doc.renderedAST
          .replace(/https:\/\/raw\.githubusercontent\.com\/angular\/angular\.io\/master\/public\/resources\/images\//g, 'assets/images/')
          .replace(/\/resources\/images\//g, 'assets/images/');
      }
    });
  }
};