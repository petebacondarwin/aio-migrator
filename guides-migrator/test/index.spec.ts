const expect = require('chai').expect;

import {resolve} from 'canonical-path';
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
      '<code-example path="cb-component-relative-paths/src/app/some.component.ts" region="module-id" linenums="false">',
      '',
      '</code-example>',
      '',
      '',
      '',
      '<code-example path="transform-makeExample/src/app/some.component.ts" region="module-id">',
      '',
      '</code-example>',
      '',
      'more text',
      '',
      '<code-example path="cb-ts-to-js/ts/src/app/some.component.ts" region="module-id" linenums="15">',
      '',
      '</code-example>',
      '',
      '',
      '',
      '<code-example path="cb-ts-to-js/js-es6-decorators/src/app/some.component.js" region="module-id">',
      '',
      '</code-example>',
      '',
      '',
    ));
  });

  it('should transform +makeTabs(...)', () => {
    expect(docs['transform-makeTabs.jade']).to.equal(_(
      'some text', '',
      '<code-tabs>', '',
      '  <code-pane title="src/app/some.component.ts" path="cb-component-relative-paths/src/app/some.component.ts">', '',
      '  </code-pane>', '',
      '  <code-pane title="src/app/some.component.html" path="cb-component-relative-paths/src/app/some.component.html">', '',
      '  </code-pane>', '',
      '  <code-pane title="src/app/some.component.css" path="cb-component-relative-paths/src/app/some.component.css">', '',
      '  </code-pane>', '',
      '  <code-pane title="src/app/app.component.ts" path="cb-component-relative-paths/src/app/app.component.ts">', '',
      '  </code-pane>', '',
      '</code-tabs>', '',
      'more text', '',
      '<code-tabs>', '',
      '  <code-pane title="src/app/some.component.ts" path="cb-component-relative-paths/src/app/some.component.ts" region="region-1">', '',
      '  </code-pane>', '',
      '  <code-pane title="src/app/some.component.html" path="cb-component-relative-paths/src/app/some.component.html">', '',
      '  </code-pane>', '',
      '  <code-pane title="src/app/app.component.ts" path="cb-component-relative-paths/src/app/app.component.ts" region="region-2">', '',
      '  </code-pane>', '',
      '</code-tabs>', '', ''
      ));
  });

  it('should transform +makeExcerpt(...)', () => {
    expect(docs['transform-makeExcerpt.jade']).to.equal(_(
      '',
      '',
      '<code-example path="transform-makeExcerpt/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (excerpt)">',
      '',
      '</code-example>',
      '',
      '',
      '',
      '<code-example path="transform-makeExcerpt/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (class)" region="class">',
      '',
      '</code-example>',
      '',
      '',
      '',
      '<code-example path="transform-makeExcerpt/src/app/hero-detail.component.ts" linenums="false" title="src/app/hero-detail.component.ts (template)" region="template-1">',
      '',
      '</code-example>',
      '',
      '',
      '',
      '<code-example path="toh-4/src/app/app.component.1.ts" linenums="false" title="toh-4/ts/src/app/app.component.ts (providers)" region="providers">',
      '',
      '</code-example>',
      '',
      ''
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
      '',
      '<aio-filetree>',
      '',
      '  <aio-folder>',
      '    app',
      '    <aio-file>',
      '      some.component.css',
      '    </aio-file>',
      '',
      '    <aio-file>',
      '      some.component.html',
      '    </aio-file>',
      '',
      '    <aio-file>',
      '      some.component.ts',
      '    </aio-file>',
      '',
      '  </aio-folder>',
      '',
      '  <aio-file>',
      '    ...',
      '  </aio-file>',
      '',
      '</aio-filetree>',
      '',
      '',
    ));
  });

  it('should fix paths to images', () => {
    expect(docs['transform-image-paths.jade']).to.equal(_(
      '<img src="assets/images/devguide/attribute-directives/first-highlight.png" alt="First Highlight"></img>' +
      '<a href="assets/images/logos/angular/angular.png" target="_blank">',
      '<img src="assets/images/logos/angular/angular.png" height="40px" title="download Angular logo"></a>',
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
      '\n\n<h1>\n  Some text\n</h1>\n\n'
    ));

    expect(docs['guide/exists.jade']).to.equal(_(
      '\n\n<h1>\n  guide\n</h1>\n\n'
    ));

    expect(docs['guide/cb-exists.jade']).to.equal(_(
      '\n\n<h1>\n  cookbook\n</h1>\n\n'
    ));
  });

  it('should remove jade "block" markers', () => {
    expect(docs['remove-block.jade']).to.equal(_(
      'before',
      '',
      '',
      '<div>',
      '  block contents',
      '</div>',
      '',
      'after',
    ));
  });

});

function _(...lines) {
  return lines.join('\n');
}