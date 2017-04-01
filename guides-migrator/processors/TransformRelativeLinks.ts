import {DocCollection, Processor} from 'dgeni';
import {PugDocument} from '../Document';
import {dirname, join} from 'canonical-path';

export class TransformRelativeLinksProcessor implements Processor {
  name = 'transformRelativeLinksProcessor';
  $after: ['moveCookbookDocsProcessor'];
  $process(docs: DocCollection) {
    docs.forEach((doc: PugDocument) => {
      if (doc.renderedAST) {
        doc.renderedAST = doc.renderedAST.replace(/(\[[^\]]+\])\(([^)]+)\)/g, (_, title, rest) => {
          let newUrl;

          const [url, tooltip] = rest.split(' ');
          const [path, hash] = url.split('#');

          if (isAbsolute(path)) {
            newUrl = path;
          } else if (!path) {
            newUrl = stripExtension(doc.relativePath);
          } else {
            newUrl = join(dirname(doc.relativePath), stripExtension(path));
          }

          if (hash) {
            newUrl = `${newUrl}#${hash}`;
          }

          if (tooltip) {
            newUrl = `${newUrl} ${tooltip}`;
          }

          return `${title}(${newUrl})`;
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



// relative links between pages
