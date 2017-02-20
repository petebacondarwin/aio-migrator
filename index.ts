import {Dgeni, DocCollection, Package} from 'dgeni';
import {ReadPugsProcessor} from './processors/ReadPugs';
import {RenderContentsProcessor} from './processors/RenderContents';
import {WriteFilesProcessor} from './processors/WriteFiles';
import {TransformAnchorsProcessor} from './processors/TransformAnchors';
import {TransformComponentsProcessor} from './processors/TransformComponents';
import {RemoveDivsProcessor} from './processors/RemoveDivs';
import {TransformFileTreesProcessor} from './processors/TransformFileTrees';
import {ExtractFilterContentsProcessor} from './processors/ExtractFilterContents';
import {TransformMixinsProcessor, makeExample, makeTabs} from './processors/TransformMixins';
import {resolve} from 'path';
import {createTextNode, createTagNode, parseInnerParams} from './processors/utils';

const migratorPackage = new Package('migrator', [])
  .processor(new ReadPugsProcessor())
  .processor(new TransformAnchorsProcessor())
  .processor(new TransformComponentsProcessor(['alert']))
  .processor(new RemoveDivsProcessor(['l-main-section', 'l-sub-section']))
  .processor(new TransformFileTreesProcessor())
  .processor(new ExtractFilterContentsProcessor(['marked']))
  .processor(new TransformMixinsProcessor({makeExample, makeTabs}))
  .processor(new RenderContentsProcessor())
  .processor(new WriteFilesProcessor())
  .config(function(readPugsProcessor: ReadPugsProcessor) {
    const AIO_PROJECT = resolve(__dirname, '../angular.io');
    readPugsProcessor.sourcePattern = resolve(AIO_PROJECT, 'public/docs/ts/latest/!(api)/*.jade');
    readPugsProcessor.sourceBase = resolve(AIO_PROJECT, 'public/docs/ts/latest');
  })
  .config(function(writeFilesProcessor: WriteFilesProcessor) {
    writeFilesProcessor.outputFolder = resolve(__dirname, 'output');
  });

module.exports = migratorPackage;