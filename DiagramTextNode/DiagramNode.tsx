/* eslint-disable no-underscore-dangle */

import * as React from 'react';
import {Suspense} from 'react';

import {
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
  SerializedEditor,
  // $applyNodeReplacement,
  createEditor,
} from 'lexical';

import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';

const DIAGRAM_TYPE: string = 'diagram-text';

import { DEFAULT_DIAGRAM_TEXT_LANGUAGE } from './DiagramNodeConstants';

export interface DiagramTextPayload {
  language: string;
  diagramDefinition: string;
  diagramTextEditor: LexicalEditor;
  // diagramRender: string;
  key?: NodeKey;
}

export type SerializedDiagramTextNode = Spread<
  {
    language: string;
    diagramDefinition: string;
    diagramTextEditor: any;
    // diagramRender: string;
    type: 'diagram-text';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

const DiagramComponent = React.lazy(
  // @ts-ignore
  () => import('./DiagramComponent'),
);

export class DiagramTextNode extends DecoratorBlockNode {
  __language: string;

  __diagramDefinition: string;
  
  __diagramTextEditor: LexicalEditor;
  
  // __diagramRender: string;

  static getType(): string {
    console.log("here")
    return DIAGRAM_TYPE;
  }

  static clone(node: DiagramTextNode): DiagramTextNode {
    return new DiagramTextNode(node.__language, node.__diagramDefinition, node.__diagramTextEditor, node.__format, node.__key);
  }

  constructor(
    language: string,
    diagramDefinition: string,
    diagramTextEditor: any,
    format?: ElementFormatType,
    key?: NodeKey
  ) {
    super(format, key);
    this.__language = language || DEFAULT_DIAGRAM_TEXT_LANGUAGE;
    this.__diagramDefinition = diagramDefinition;
    this.__diagramTextEditor = diagramTextEditor || createEditor();
  }

  static importJSON(serializedNode: SerializedDiagramTextNode): DiagramTextNode {
    const {language, diagramDefinition, diagramTextEditor, format } = serializedNode;
    const node = $createDiagramTextNode({language, diagramDefinition, diagramTextEditor});
    node.setFormat(format);

    const nestedEditor = node.__diagramTextEditor;
    const editorState = nestedEditor.parseEditorState(diagramTextEditor.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportJSON(): SerializedDiagramTextNode {
    return {
      ...super.exportJSON(),
      language: this.getLanguage(),
      diagramDefinition: this.getDiagramDefinition(),
      diagramTextEditor: this.__diagramTextEditor.toJSON(),
      type: 'diagram-text',
      version: 1,
    };
  }

  getLanguage(): string {
    return this.__language;
  }

  setLanguage(language: string): void {
    const self = this.getWritable();
    self.__language = language;
  }

  getDiagramDefinition(): string {
    return this.__diagramDefinition;
  }

  setDiagramDefinition(diagramDefinition: string): void {
    const self = this.getWritable();
    self.__diagramDefinition = diagramDefinition;
  }

  // createDOM(): HTMLElement {
  //   return document.createElement('div');
  // }

  // updateDOM(): false {
  //   return false;
  // }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return null
  }

  // isInline(): false {
  //   return false;
  // }
}

export function $createDiagramTextNode({language, diagramDefinition, diagramTextEditor}: DiagramTextPayload): DiagramTextNode {
  return new DiagramTextNode(language, diagramDefinition, diagramTextEditor);
}

export function $isDiagramTextNode(
  node: DiagramTextNode | LexicalNode | null | undefined,
): node is DiagramTextNode {
  return node instanceof DiagramTextNode;
}
