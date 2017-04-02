import { MixinReplacer } from '../TransformMixins';
import { CodeAttributes, encodeHTML, computeFilePath, computeTitleFromPath, getExampleRelativePath, createTagNode} from '../utils';

export const makeExample: MixinReplacer = (doc, node, params, extraParams, replace) => {
  const fullPath = computeFilePath(params[0], doc.baseName);
  const relativePath = getExampleRelativePath(fullPath, doc.baseName);

  const attributes: CodeAttributes = {
    path: `"${fullPath}"`,
  };

  if (params[1] && params[1] !== 'null') {
    attributes.region = `"${params[1]}"`;
  }

  if (params[2] !== '' && params[2] !== null) {
    attributes.title = `"${encodeHTML(params[2] || computeTitleFromPath(relativePath))}"`;
  }

  const format = extraParams['format'];
  if (format) {
    if (format === '.') {
      attributes.linenums = '"false"';
    } else {
      const [key, value] = format.split(':');
      if (key === 'linenums') {
        attributes.linenums = `"${value}"`;
      }
    }
  }

  replace([
    createTagNode(node, 'code-example', attributes as any, [])
  ]);
};