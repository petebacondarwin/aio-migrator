import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {dirname, join} from 'canonical-path';

export class TransformHtmlAnchorsProcessor implements Processor {
  name = 'transformHtmlAnchorsProcessor';
  $after: ['moveCookbookDocsProcessor'];
  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.renderedAST) {
        doc.renderedAST = doc.renderedAST.replace(/<a id="([^"]+)"><\/a>/g, (_, id) => {
          return `{@a ${id}}`;
        });
      }
    });
  }
};
