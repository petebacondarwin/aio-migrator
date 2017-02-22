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
  let inArgument: boolean = false;
  let inString: boolean = false;
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
          saveArg();
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
    saveArg();
  }

  return args.map(arg => arg.trim());

  function saveArg() {
    args.push(argString.substring(startArgIndex, endArgIndex + 1));
    startArgIndex = index + 1;
    endArgIndex = index + 1;
  }
}

export function parseInnerParams(paramString: string) {
  return (paramString === null) ? [] : parseArgs(paramString);
}
