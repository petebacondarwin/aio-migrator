const expect = require('chai').expect;

import {resolve} from 'path';
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
    expect(docs['remove-utils.jade']).to.equal(_(
    ));
  });

  it('should remove and unindent `.l-main-section`', () => {
    expect(docs['remove-main-section.jade']).to.equal(_(
      '',
      '## some heading',
    ));
  });

  it('should transform `.l-sub-section`', () => {
    expect(docs['transform-sub-section.jade']).to.equal(_(
      'Some content',
      '',
      '',
      '~~~ {.l-sub-section}',
      '',
      '## some heading',
      '',
      '~~~',
      '',
      ''
    ));
  });

  it('should transform `.alert` components', () => {
    expect(docs['transform-alerts.jade']).to.equal(_(
      '',
      '',
      '~~~ {.alert.is-important}',
      '',
      'abc',
      'xyz',
      '',
      '~~~',
      '',
      'new content',
      '',
      '~~~ {.alert.is-helpful}',
      '',
      'content',
      '',
      '~~~',
      '',
      '',
    ));
  });

  it('should remove and unindent `:marked` blocks', () => {
    expect(docs['remove-marked.jade']).to.equal(_(
      '# heading 1',
      '',
      'a paragraph',
    ));
  });

  it('should transform +makeExample(...)', () => {
    expect(docs['transform-makeExample.jade']).to.equal(_(
      'some text',
      '',
      '{@example \'cb-component-relative-paths/src/app/some.component.ts\' region=\'module-id\'}',
      '',
      'more text',
    ));
  });

  it('should transform +makeTabs(...)', () => {
    expect(docs['transform-makeTabs.jade']).to.equal(_(
      'some text',
      '',
      '<md-tab-group>',
      '',
      '  <md-tab label="src/app/some.component.ts">',
      '    {@example \'cb-component-relative-paths/src/app/some.component.ts\'}',
      '  </md-tab>',
      '',
      '',
      '  <md-tab label="src/app/some.component.html">',
      '    {@example \'cb-component-relative-paths/src/app/some.component.html\'}',
      '  </md-tab>',
      '',
      '',
      '  <md-tab label="src/app/some.component.css">',
      '    {@example \'cb-component-relative-paths/src/app/some.component.css\'}',
      '  </md-tab>',
      '',
      '',
      '  <md-tab label="src/app/app.component.ts">',
      '    {@example \'cb-component-relative-paths/src/app/app.component.ts\'}',
      '  </md-tab>',
      '',
      '',
      '</md-tab-group>',
      '',
      'more text',
      ));
  });

  it('should transform manual anchor tags', () => {
    expect(docs['transform-anchors.jade']).to.equal(_(
      '',
      '',
      '{@a webpack}',
      '## WebPack: load templates and styles',
      '',
      'some paragraph',
      '',
      '{@a next}',
      '## Another Heading'
    ));
  });

  it('should transform .filetree structures to HTML', () => {
    expect(docs['transform-filetrees.jade']).to.equal(_(
      '',
      '<aio-filetree>',
      '',
      '  <aio-folder>',
      '    app',
      '    <aio-file>',
      '      some.component.css',
      '    </aio-file>',
      '',
      '',
      '    <aio-file>',
      '      some.component.html',
      '    </aio-file>',
      '',
      '',
      '    <aio-file>',
      '      some.component.ts',
      '    </aio-file>',
      '',
      '',
      '  </aio-folder>',
      '',
      '',
      '  <aio-file>',
      '    ...',
      '  </aio-file>',
      '',
      '',
      '</aio-filetree>',
      '',
      '',
    ));
  });

  it('should fix paths to images', () => {
    expect(docs['transform-image-paths.jade']).to.equal(_(
      '<img src="assets/images/devguide/attribute-directives/first-highlight.png" alt="First Highlight"></img>',
    ));
  });

  it('should fix paths to relative links', () => {
    expect(docs['guide/transform-relative-links.jade']).to.equal(_(
     '[guide 1](guide/guide-1)',
     '[tutorial 1](tutorial/tutorial-1)',
     '[internal link](guide/transform-relative-links#fragment)'
    ));
  });

  it('should move cookbook docs to the guide folder, renaming if necessary', () => {
    expect(docs['guide/test.jade']).to.equal(_(
      '\n<h1>\n  Some text\n</h1>\n\n'
    ));

    expect(docs['guide/exists.jade']).to.equal(_(
      '\n<h1>\n  guide\n</h1>\n\n'
    ));

    expect(docs['guide/cb-exists.jade']).to.equal(_(
      '\n<h1>\n  cookbook\n</h1>\n\n'
    ));
  });

});

function _(...lines) {
  return lines.join('\n');
}