import * as pug from '../pug-interfaces';

export function collectClasses(tagNode: pug.Tag): Object {
  const cssClasses = {};
  tagNode.attrs.forEach(attr => {
    if (attr.name === 'class') {
      cssClasses[attr.val.substring(1, attr.val.length - 1)] = true;
    }
  });
  return cssClasses;
}

export function createTextNode(from: pug.Node, val: string): pug.Text {
  return {
    type: 'Text',
    filename: from.filename,
    line: from.line,
    column: from.column,
    val
  };
}

export function createTagNode(from: pug.Node, name: string, attrs: {[key: string]: string}, childNodes: pug.Node[], isInline = false, selfClosing = false): pug.Tag {
  return {
    type: 'Tag',
    name,
    filename: from.filename,
    line: from.line,
    column: from.column,
    attributeBlocks: [],
    attrs: Object.keys(attrs).map(name => ({ name, val: attrs[name], mustEscape: false })),
    isInline,
    selfClosing,
    block: childNodes && {
      type: 'Block',
      filename: from.filename,
      line: from.line,
      column: from.column,
      nodes: childNodes
    }
  };
}

// Split the string into the comma delimited parameters
// Takes into account that a param may be a string that contains commas.
export function parseParams(paramString: string) {
  try {
    // SECURITY: the paramString is taken from docs written by the Angular team and considered safe
    /* tslint:disable-next-line:no-eval */
    const params = eval('[' + paramString + ']');
    return params.map(param => param && (param.trim ? param.trim() : param));
  } catch (e) {
    if (e) {
      // The eval might fail if there were no quotes around the string
      return paramString.split(',').map(param => param && (param.trim ? param.trim() : param));
    }
  }
}


export function parseInnerParams(paramString: string) {
  if (paramString === null) {
    return [];
  }
  const firstChar = paramString[0];
  if ('\'"`'.indexOf(firstChar) !== -1) {
    paramString = paramString.substr(1, paramString.length - 2);
  }
  return parseParams(paramString);
}