import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {dirname, join} from 'path';

export class TransformRelativeLinksProcessor implements Processor {
  name = 'transformRelativeLinksProcessor';
  $after: ['moveCookbookDocsProcessor'];
  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.renderedAST) {
        doc.renderedAST = doc.renderedAST.replace(/(\[[^\]]+\])\(([^)]+)\)/g, (_, title, url) => {
          if (url[0] === '#') {
            url = stripExtension(doc.relativePath) + url;
          } else if (!isAbsolute(url)) {
            url = join(dirname(doc.relativePath), stripExtension(url));
          }
          return `${title}(${url})`;
        });
      }
    });
  }
};

function stripExtension(url: string) {
  // the capturing group is to ensure we don't accidentally capture `../some/path/file-with-no-extension`
  return url.replace(/\.[^\/]+$/, '');
}

function isAbsolute(url: string) {
  return /^[a-z]+:\/\/|^\/\/|^\//i.test(url);
}