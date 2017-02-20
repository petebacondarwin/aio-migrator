import {Block} from './pug-interfaces';

export class PugDocument {
  renderedContent: string;
  constructor(
      public filePath: string,
      public relativePath: string,
      public contents: string,
      public ast: Block) {
  }
}
