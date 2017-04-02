import * as pug from '../pug-interfaces';
import {join} from 'canonical-path';

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

export function stripQuotes(str: string) {
  if (str) {
    const firstChar = str.charAt(0);
    const lastChar = str.charAt(str.length - 1);
    if ('"\'`'.indexOf(firstChar) !== -1 && firstChar === lastChar) {
      return str.substr(1, str.length - 2);
    }
  }
  return str;
}

enum ParseState {
  beforeArgument,
  inArgument,
  afterComma,
  inString,
  afterString
}

// Split the string into the comma delimited parameters
// Takes into account that a param may be a string that contains commas.
export function parseArgs(argString: string) {
  let state: ParseState = ParseState.beforeArgument;
  let stringType: string;
  let index = 0;
  let startArgIndex;
  let endArgIndex;
  const args: string[] = [];

  argString = argString.trim();
  while (index < argString.length) {
    const char = argString[index];

    switch (state) {
      case ParseState.beforeArgument:
      case ParseState.afterComma:
        if (char === ',') {
          // empty argument
          args.push('');
          startArgIndex = index + 1;
          endArgIndex = index + 1;
          state = ParseState.afterComma;
        } else if ('\'"`'.indexOf(char) !== -1) {
          // enter string (a quote char)
          stringType = char;
          startArgIndex = index + 1;
          state = ParseState.inString;
        } else if (/\S/.test(char)) {
          // enter non-quoted argument (first non-whitespace)
          startArgIndex = index;
          endArgIndex = index;
          state = ParseState.inArgument;
        }
        break;

      case ParseState.inArgument:
        if (char === ',') {
          // exit argument
          saveArg(true);
          state = ParseState.afterComma;
        } else {
          // inside a non-quoted argument
          endArgIndex = index;
        }
        break;

      case ParseState.inString:
        // inside a quoted argument
        if (char === stringType) {
          // exit string (matching quote char)
          endArgIndex = index - 1;
          state = ParseState.afterString;
        } else if (char === '\\' && argString[index + 1] === stringType) {
          // escape quote
          const before = argString.substring(0, index);
          const after = argString.substring(index + 1);
          argString = before + after;
        }
        break;
      case ParseState.afterString:
        if (char === ',') {
          // exit argument
          saveArg();
          state = ParseState.afterComma;
        }
        break;
    }
    index++;
  }

  if (state === ParseState.inString) {
    throw new Error('unclosed string');
  }

  if (state === ParseState.inArgument ||
      state === ParseState.afterString ||
      state === ParseState.afterComma) {
    // capture last argument
    saveArg(state === ParseState.inArgument);
  }

  return args.map(arg => arg && arg.trim());

  function saveArg(unquoted = false) {
    let arg = argString.substring(startArgIndex, endArgIndex + 1);
    if (unquoted) {
      arg = (arg === 'null') ? null :
            (arg === 'undefined') ? undefined :
            arg;
    }
    args.push(arg);
    startArgIndex = index + 1;
    endArgIndex = index + 1;
  }
}

export function parseInnerParams(paramString: string) {
  return (paramString === null) ? [] : parseArgs(paramString);
}

export interface CodeAttributes {
  path: string;
  region?: string;
  title?: string;
  linenums?: string;
}

const PATH_TRANSFORM_EXCEPTIONS = [/cb-ts-to-js\/(js|ts)/];

// Converts the given example-relative path (like 'app/main.ts')
// to a site-relative path (like 'quickstart/ts/app/main.ts')
export function computeFilePath(filePath, exampleName) {
  filePath = stripQuotes(filePath);
  if (isRelativeToExample(filePath, exampleName)) {
    filePath = join(exampleName, filePath);
  }
  if (PATH_TRANSFORM_EXCEPTIONS.some(pattern => pattern.test(filePath))) {
    return filePath;
  } else {
    return filePath.replace(/\/(js|ts|dart)\//, '/');
  }
}

// Expects the path to be relative to the example (may need to use `getExampleRelativePath` first)
// Title is not given so use the filePath, removing any '.1' or '_1' qualifier on the end
export function computeTitleFromPath(exampleRelativePath) {
  const matches = exampleRelativePath.match(/^(.*)[\._]\d(\.\w+)$/);
  return matches ? matches[1] + matches[2] : exampleRelativePath;
}

export function isRelativeToExample(path, exampleName) {
  return path.indexOf(exampleName) !== 0 &&
         !path.match(/\/(js|ts|dart)(-snippets|-es6(-decorators)?)?\//) &&
         !path.endsWith('e2e-spec.ts');
  // Last conjunct handles case for shared project e2e test file like
  // cb-component-communication/e2e-spec.js (is shared between ts & dart)
}

export function getExampleRelativePath(path, exampleName) {
  return path.replace(new RegExp('^' + exampleName + '/'), '');
}

export function encodeHTML(text) {
  return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
