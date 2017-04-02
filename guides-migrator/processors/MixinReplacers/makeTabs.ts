import { MixinReplacer } from '../TransformMixins';
import { parseInnerParams, stripQuotes, CodeAttributes, encodeHTML, computeFilePath, computeTitleFromPath, getExampleRelativePath, createTagNode} from '../utils';

export const makeTabs: MixinReplacer = (doc, node, params, extraParams, replace) => {
  const files = parseInnerParams(stripQuotes(params[0]));
  const regions = parseInnerParams(stripQuotes(params[1]));
  const titles = parseInnerParams(stripQuotes(params[2]));
  const tabNodes = files.map((file, index) => {
    const fullPath = computeFilePath(file, doc.baseName);
    const relativePath = getExampleRelativePath(fullPath, doc.baseName);
    const attributes: CodeAttributes = {
      title: `"${encodeHTML(titles[index] || computeTitleFromPath(relativePath))}"`,
      path: `"${fullPath}"`
    };
    if (regions[index] && regions[index] !== 'null') {
      attributes.region = `"${regions[index]}"`;
    }
    return createTagNode(node, 'code-pane', attributes as any, []);
  });
  replace([
    createTagNode(node, 'code-tabs', {}, tabNodes)
  ]);
};