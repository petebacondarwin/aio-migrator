import {Block} from './pug-interfaces';

export class Document {
  docType = 'document';
  constructor(
      public filePath: string,
      public relativePath: string) {}
}

export class ContentDocument extends Document {
  docType = 'content-document';
  title: string;
  intro: string;
  constructor(
      filePath: string,
      relativePath: string,
      public contents: string) {
    super(filePath, relativePath);
  }
}

export class PugDocument extends ContentDocument {
  docType = 'pug-document';
  ast: Block;
  renderedAST: string;
}

export class DataDocument extends Document {
  docType = 'data-document';
  constructor(
      filePath: string,
      relativePath: string,
      public data: any) {
    super(filePath, relativePath);
  }
}
