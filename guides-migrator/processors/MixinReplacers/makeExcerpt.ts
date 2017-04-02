import { MixinReplacer } from '../TransformMixins';
import { stripQuotes, CodeAttributes, encodeHTML, computeFilePath, computeTitleFromPath, getExampleRelativePath, createTagNode} from '../utils';

export const makeExcerpt: MixinReplacer = (doc, node, params, extraParams, replace) => {
  const matches = params[0].match(/(.*?)(?:\s+\(([^\)]*)\))?$/);

  const fullPath = computeFilePath(matches[1], doc.baseName);
  const relativePath = getExampleRelativePath(fullPath, doc.baseName);
  const parenthesis = matches[2];
  const region = (params[1] && params[1] !== 'null') ? stripQuotes(params[1]) : parenthesis;

  const attributes: CodeAttributes = {
    path: `"${fullPath}"`,
    linenums: '"false"',
    title: `"${encodeHTML(computeTitleFromPath(relativePath))} (${encodeHTML(parenthesis || region || 'excerpt')})"`
  };

  if (region) {
    attributes.region = `"${region}"`;
  }

  replace([
    createTagNode(node, 'code-example', attributes as any, [])
  ]);
};