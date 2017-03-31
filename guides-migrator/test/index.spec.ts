const expect = require('chai').expect;

import {resolve} from 'canonical-path';
import  {readFileSync} from 'fs';
import {Dgeni, Package, Processor, DocCollection} from 'dgeni';
import {WriteFilesProcessor} from '../processors/WriteFiles';
import {ReadPugsProcessor} from '../processors/ReadPugs';
import {PugDocument} from '../Document';
const migratorPackage = require('..');
const {sync: mkdirp} = require('mkdirp');

describe('migrator', () => {
  let docs;
  beforeEach(() => {
    class GetDocsProcessor implements Processor {
      name = 'getDocsProcessor';
      $process(_docs: DocCollection) {
        docs = {};
        _docs.forEach((doc: PugDocument) => docs[doc.relativePath] = doc.renderedAST);
      }
    }

    const testPackage = new Package('testPackage', [migratorPackage])
      .processor(new GetDocsProcessor())
      .config(function(readPugsProcessor: ReadPugsProcessor) {
        readPugsProcessor.sourceBase = resolve(__dirname, 'mocks');
        readPugsProcessor.sourcePattern = '**/*.jade';
      })
      .config(function (writeFilesProcessor: WriteFilesProcessor) {
        (writeFilesProcessor as any).$enabled = false;
      })
      .config(function(log) {
        log.level = 'warn';
      });

    const dgeni = new Dgeni([testPackage]);
    return dgeni.generate();
  });

  it('should remove `include ../_util-fns`', () => {
    expect(docs['remove-utils.jade']).to.equal(readFile('remove-utils.md'));
  });

  it('should remove and unindent `.l-main-section`', () => {
    expect(docs['remove-main-section.jade']).to.equal(readFile('remove-main-section.md'));
  });

  it('should transform `.l-sub-section`', () => {
    expect(docs['transform-sub-section.jade']).to.equal(readFile('transform-sub-section.md'));
  });

  it('should transform `.alert` components', () => {
    expect(docs['transform-alerts.jade']).to.equal(readFile('transform-alerts.md'));
  });

  it('should remove and unindent `:marked` blocks', () => {
    expect(docs['remove-marked.jade']).to.equal(readFile('remove-marked.md'));
  });

  it('should transform +makeExample(...)', () => {
    expect(docs['transform-makeExample.jade']).to.equal(readFile('transform-makeExample.md'));
  });

  it('should transform +makeTabs(...)', () => {
    expect(docs['transform-makeTabs.jade']).to.equal(readFile('transform-makeTabs.md'));
  });

  it('should transform +makeExcerpt(...)', () => {
    expect(docs['transform-makeExcerpt.jade']).to.equal(readFile('transform-makeExcerpt.md'));
  });

  it('should transform manual anchor tags', () => {
    expect(docs['transform-anchors.jade']).to.equal(readFile('transform-anchors.md'));
  });

  it('should transform .filetree structures to HTML', () => {
    expect(docs['transform-filetrees.jade']).to.equal(readFile('transform-filetrees.md'));
  });

  it('should fix paths to images', () => {
    expect(docs['transform-image-paths.jade']).to.equal(readFile('transform-image-paths.md'));
  });

  it('should fix paths to relative links', () => {
    expect(docs['guide/transform-relative-links.jade']).to.equal(readFile('guide/transform-relative-links.md'));
  });

  it('should move cookbook docs to the guide folder, renaming if necessary', () => {
    expect(docs['guide/test.jade']).to.equal(readFile('guide/test.md'));
    expect(docs['guide/exists.jade']).to.equal(readFile('guide/exists.md'));
    expect(docs['guide/cb-exists.jade']).to.equal(readFile('guide/cb-exists.md'));
  });

  it('should remove jade "block" markers', () => {
    expect(docs['remove-block.jade']).to.equal(readFile('remove-block.md'));
  });

  it('should transform horizontal rule markers', () => {
    expect(docs['transform-horizontal-rules.jade']).to.equal(readFile('transform-horizontal-rules.md'));
  });
});

function readFile(filePath) {
  return readFileSync(resolve(__dirname, 'mocks', filePath), 'utf8');
}
