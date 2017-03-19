import {Dgeni, DocCollection, Package} from 'dgeni';
import {ReadPugsProcessor} from './processors/ReadPugs';
import {ReadDataFilesProcessor} from './processors/ReadDataFiles';
import {ReadContentFilesProcessor} from './processors/ReadContentFiles';
import {RenderASTProcessor} from './processors/RenderAST';
import {AttachMetaDataProcessor} from './processors/AttachMetaData';
import {WriteFilesProcessor} from './processors/WriteFiles';
import {TransformAnchorsProcessor} from './processors/TransformAnchors';
import {TransformComponentsProcessor} from './processors/TransformComponents';
import {RemoveDivsProcessor} from './processors/RemoveDivs';
import {TransformFileTreesProcessor} from './processors/TransformFileTrees';
import {ExtractFilterContentsProcessor} from './processors/ExtractFilterContents';
import {TransformMixinsProcessor, makeExample, makeTabs} from './processors/TransformMixins';
import {TransformImagePathsProcessor} from './processors/TransformImagePaths';
import {MoveCookbookDocsProcessor} from './processors/MoveCookbookDocs';
import {TransformRelativeLinksProcessor} from './processors/TransformRelativeLinks';
import {resolve} from 'path';
import {createTextNode, createTagNode, parseInnerParams} from './processors/utils';

const migratorPackage = new Package('migrator', [])
  .processor(new ReadPugsProcessor())
  .processor(new ReadDataFilesProcessor())
  .processor(new ReadContentFilesProcessor())
  .processor(new TransformAnchorsProcessor())
  .processor(new TransformComponentsProcessor(['alert', 's-rule', 'callout', 'l-sub-section']))
  .processor(new RemoveDivsProcessor(['l-main-section']))
  .processor(new TransformFileTreesProcessor())
  .processor(new ExtractFilterContentsProcessor(['marked']))
  .processor(new TransformMixinsProcessor({makeExample, makeTabs}))
  .processor(new RenderASTProcessor())
  .processor(new TransformImagePathsProcessor())
  .processor(new AttachMetaDataProcessor())
  .processor(new MoveCookbookDocsProcessor())
  .processor(new TransformRelativeLinksProcessor())
  .processor(new WriteFilesProcessor())
  .config(function(
        readPugsProcessor: ReadPugsProcessor,
        readDataFilesProcessor: ReadDataFilesProcessor,
        readContentFilesProcessor: ReadContentFilesProcessor) {
    const AIO_PROJECT = resolve(__dirname, '../angular.io');
    readPugsProcessor.sourcePattern = resolve(AIO_PROJECT, 'public/docs/ts/latest/!(api)/!(cheatsheet).jade');
    readPugsProcessor.sourceBase = resolve(AIO_PROJECT, 'public/docs/ts/latest');

    readDataFilesProcessor.sourcePattern = resolve(AIO_PROJECT, 'public/docs/ts/latest/!(api)/_data.json');
    readDataFilesProcessor.sourceBase = resolve(AIO_PROJECT, 'public/docs/ts/latest');

    readContentFilesProcessor.sourcePattern = resolve(__dirname, 'content/**/*.{html,md}');
    readContentFilesProcessor.sourceBase = resolve(__dirname, 'content');
  })
  .config(function(writeFilesProcessor: WriteFilesProcessor) {
    writeFilesProcessor.outputFolder = resolve(__dirname, 'output');
  });

module.exports = migratorPackage;