import {DocCollection, Processor} from 'dgeni';
import {Block} from '../pug-interfaces';
import {PugDocument} from '../Document';

import {readFileSync} from 'fs';
import {resolve, relative, basename, extname} from 'canonical-path';
const glob = require('glob');
const lex = require('pug-lexer');
const parse = require('pug-parser');

export class ReadPugsProcessor implements Processor {
  name = 'readPugsProcessor';
  sourcePattern: string;
  sourceBase: string;

  $process(docs: DocCollection) {
    const paths: string[] = glob.sync(resolve(this.sourceBase, this.sourcePattern));
    paths.forEach(filePath => {
      const contents = readFileSync(filePath, 'utf8');
      try {
        const ast = parse(lex(contents)) as Block;
        const baseName = basename(filePath, extname(filePath));
        const doc = new PugDocument(filePath, relative(this.sourceBase, filePath), baseName, contents);
        doc.ast = ast;
        docs.push(doc);
      } catch (e) {
        console.log('Failed to process', filePath, e);
      }
    });
  }
}
