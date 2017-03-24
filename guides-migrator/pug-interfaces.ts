/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type ReplaceFunction = (replacement: Node | Array<Node>) => boolean;

export type NodeTypes = 'Block' |
                        'Doctype' |
                        'Comment' |
                        'BlockComment' |
                        'Text' |
                        'Tag' |
                        'InterpolatedTag' |
                        'Code' |
                        'Conditional' |
                        'Case' |
                        'When' |
                        'While' |
                        'Each' |
                        'Mixin' |
                        'MixinBlock' |
                        'YieldBlock' |
                        'FileReference' |
                        'Include' |
                        'RawInclude' |
                        'IncludeFilter' |
                        'Extends' |
                        'NamedBlock' |
                        'Filter';

export interface Node {
  type: NodeTypes;
  line: number;            // line number of the start position of the node
  column: number | null;   // column number at the starting position of the node
  filename: string | null; // the name of the file the node originally belongs to
}

export interface Block extends Node {
  type: 'Block';
  nodes: Array<Node>;
}

export interface AttributedNode extends Node {
  attrs: Array<Attribute>;                      // all the individual attributes of the node
  attributeBlocks: Array<JavaScriptExpression>; // all the &attributes expressions effective on this node
}

export interface BlockNode extends Node {
  block: Block | null;
}

export interface ExpressionNode extends Node {
  expr: JavaScriptExpression;
}

export interface PlaceholderNode extends Node { }

export interface ValueNode extends Node {
  val: string;
}

export interface Attribute {
  name: string;               // the name of the attribute
  val: JavaScriptExpression;  // JavaScript expression returning the value of the attribute
  mustEscape: boolean;        // if the value must be HTML-escaped before being buffered
}

export type JavaScriptExpression = string;
export type JavaScriptIdentifier = string;

export interface Doctype extends ValueNode {
  type: 'Doctype';
}

export interface CommonComment extends ValueNode {
  buffer: boolean; // whether the comment should appear when rendered
}

export interface Comment extends CommonComment {
  type: 'Comment';
}

export interface BlockComment extends BlockNode, CommonComment {
  type: 'BlockComment';
}

export interface Text extends ValueNode {
  type: 'Text';
}

export interface CommonTag extends AttributedNode, BlockNode {
  selfClosing: boolean;       // if the tag is explicitly stated as self-closing
  isInline: boolean;          // if the tag is defined as an inline tag as opposed to a block-level tag
}

export interface Tag extends CommonTag {
  type: 'Tag';
  name: string;               // the name of the tag
}

export interface InterpolatedTag extends CommonTag, ExpressionNode {
  type: 'InterpolatedTag';
}

export interface Code extends BlockNode, ValueNode {
  type: 'Code';
  buffer: boolean;            // if the value of the piece of code is buffered in the template
  mustEscape: boolean;        // if the value must be HTML-escaped before being buffered
  isInline: boolean;          // whether the node is the result of a string interpolation
}

export interface Conditional extends Node {
  type: 'Conditional';
  test: JavaScriptExpression;
  consequent: Block;
  alternate: Conditional | Block | null;
}

export interface Case extends BlockNode, ExpressionNode {
  type: 'Case';
  block: WhenBlock;
}

export interface WhenBlock extends Block {
  nodes: Array<When>;
}

export interface When extends BlockNode, ExpressionNode {
  type: 'When';
  expr: JavaScriptExpression | 'default';
}

export interface While extends BlockNode {
  type: 'While';
  test: JavaScriptExpression;
}

export interface Each extends BlockNode {
  type: 'Each';
  obj: JavaScriptExpression;        // the object or array that is being looped
  val: JavaScriptIdentifier;        // the variable name of the value of a specific object property or array member
  key: JavaScriptIdentifier | null; // the variable name, if any, of the object property name or array index of `val`
  alternate: Block | null;          // the else expression
}

export interface Mixin extends AttributedNode, BlockNode {
  type: 'Mixin';
  name: JavaScriptIdentifier;       // the name of the mixin
  call: boolean;                    // if this node is a mixin call (as opposed to mixin definition)
  args: string;                     // list of arguments (declared in case of mixin definition, or specified in case of mixin call)
}


export interface MixinBlock extends PlaceholderNode {
  type: 'MixinBlock';
}



export interface YieldBlock extends PlaceholderNode {
  type: 'YieldBlock';
}


export interface FileReference extends Node {
  type: 'FileReference';
  path: string;
}


export interface FileNode extends Node {
  file: FileReference;
}


export interface Include extends BlockNode, FileNode {
  type: 'Include';
}

export interface RawInclude extends FileNode {
  type: 'RawInclude';
  filters: Array<IncludeFilter>;
}

export interface IncludeFilter extends FilterNode {
  type: 'IncludeFilter';
}

export interface Extends extends FileNode {
  type: 'Extends';
}

export interface NamedBlock extends PlaceholderNode {
  type: 'NamedBlock';
  name: string;
  mode: 'replace' | 'append' | 'prepend';
  nodes: Array<Node>; // no elements if the NamedBlock is a placeholder
}

export interface FilterNode extends Node {
  name: string;
  attrs: Array<Attribute>; // filter options
}

export interface Filter extends FilterNode, BlockNode {
  type: 'Filter';
}