import {Dgeni, DocCollection, Package} from 'dgeni';
import {ReadPugsProcessor} from './processors/ReadPugs';
import {ReadDataFilesProcessor} from './processors/ReadDataFiles';
import {ReadContentFilesProcessor} from './processors/ReadContentFiles';
import {RenderASTProcessor} from './processors/RenderAST';
import {AttachMetaDataProcessor} from './processors/AttachMetaData';
import {WriteFilesProcessor} from './processors/WriteFiles';
import {TransformAnchorsProcessor} from './processors/TransformAnchors';
import {TransformHorizontalRuleProcessor} from './processors/TransformHorizontalRules';
import {TransformComponentsProcessor} from './processors/TransformComponents';
import {RemoveDivsProcessor} from './processors/RemoveDivs';
import {TransformFileTreesProcessor} from './processors/TransformFileTrees';
import {ExtractFilterContentsProcessor} from './processors/ExtractFilterContents';
import {TransformMixinsProcessor, makeExample, makeTabs, makeExcerpt} from './processors/TransformMixins';
import {TransformImagePathsProcessor} from './processors/TransformImagePaths';
import {MoveDocsProcessor} from './processors/MoveDocs';
import {TransformRelativeLinksProcessor} from './processors/TransformRelativeLinks';
import {RemoveBlockMarkersProcessor} from './processors/RemoveBlockMarkers';
import {resolve} from 'canonical-path';
import {createTextNode, createTagNode, parseInnerParams} from './processors/utils';
const { rm } = require('shelljs');

const migratorPackage = new Package('migrator', [])
  .processor(new ReadPugsProcessor())
  .processor(new ReadDataFilesProcessor())
  .processor(new ReadContentFilesProcessor())
  .processor(new TransformAnchorsProcessor())
  .processor(new TransformHorizontalRuleProcessor())
  .processor(new TransformComponentsProcessor(['alert', 's-rule', 'callout', 'l-sub-section']))
  .processor(new RemoveDivsProcessor(['l-main-section']))
  .processor(new RemoveBlockMarkersProcessor())
  .processor(new TransformFileTreesProcessor())
  .processor(new ExtractFilterContentsProcessor(['marked']))
  .processor(new TransformMixinsProcessor({makeExample, makeTabs, makeExcerpt}))
  .processor(new RenderASTProcessor())
  .processor(new TransformImagePathsProcessor())
  .processor(new AttachMetaDataProcessor())
  .processor(new MoveDocsProcessor())
  .processor(new TransformRelativeLinksProcessor())
  .processor(new WriteFilesProcessor())
  .config(function(
        readPugsProcessor: ReadPugsProcessor,
        readDataFilesProcessor: ReadDataFilesProcessor,
        readContentFilesProcessor: ReadContentFilesProcessor) {

    const OLD_AIO_PROJECT = resolve(__dirname, '../../angular.io');

    readPugsProcessor.sourcePattern = '{!(api)/!(cheatsheet).jade,{*quickstart,glossary}.jade}';
    readPugsProcessor.sourceBase = resolve(OLD_AIO_PROJECT, 'public/docs/ts/latest');

    readDataFilesProcessor.sourcePattern = resolve(OLD_AIO_PROJECT, 'public/docs/ts/latest/!(api)/_data.json');
    readDataFilesProcessor.sourceBase = resolve(OLD_AIO_PROJECT, 'public/docs/ts/latest');

    readContentFilesProcessor.sourcePattern = resolve(__dirname, 'content/**/*.{html,md}');
    readContentFilesProcessor.sourceBase = resolve(__dirname, 'content');
  })
  .config(function(writeFilesProcessor: WriteFilesProcessor) {
    const NEW_AIO_PROJECT = resolve(__dirname, '../../angular/aio');
    writeFilesProcessor.outputFolder = resolve(NEW_AIO_PROJECT, 'content');

    // Clean out the target folders
    rm('-rf', resolve(NEW_AIO_PROJECT, 'content/guide'));
    rm('-rf', resolve(NEW_AIO_PROJECT, 'content/tutorial'));

  });

module.exports = migratorPackage;