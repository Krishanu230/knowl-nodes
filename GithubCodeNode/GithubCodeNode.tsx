import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';
import { DecoratorBlockNode, SerializedDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
//components
import { GithubCodeNodeInterface } from './githubInterfaces';

const GITHUB_CODE: string = 'githubNode';

//needed for import apis
function convertGithubCodeElement(domNode: HTMLDivElement): DOMConversionOutput | null {
  const githubNodeId = domNode.getAttribute('data-lexical-github-code-id');
  const documentId = domNode.getAttribute('data-lexical-github-document-id');
  const mark_id = domNode.getAttribute('data-lexical-github-linkedMarkNode-id');
  if (githubNodeId && documentId && mark_id) {
    const node = $createGithubCodeNode({ githubNodeId, documentId, mark_id });
    return { node };
  }
  return null;
}

//needed for markdown apis
export type SerializedGithubCodeNode = Spread<
  {
    id: string;
    type: 'githubNode';
    documentId: string;
    linkedMarkNodeId: string;
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

export class GithubCodeNode extends DecoratorBlockNode {
  __id: string;
  __documentId: string;
  __linkedMarkNodeId: string;

  static getType(): string {
    return GITHUB_CODE;
  }

  static clone(node: GithubCodeNode): GithubCodeNode {
    return new GithubCodeNode(node.__documentId, node.__id, node.__linkedMarkNodeId, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedGithubCodeNode): GithubCodeNode {
    const { id, documentId, linkedMarkNodeId, format } = serializedNode;
    const node = $createGithubCodeNode({ githubNodeId: id, documentId, mark_id: linkedMarkNodeId });
    node.setFormat(format);
    return node;
  }

  exportJSON(): SerializedGithubCodeNode {
    return {
      ...super.exportJSON(),
      id: this.__id,
      type: 'githubNode',
      version: 1,
      documentId: this.__documentId,
      linkedMarkNodeId: this.__linkedMarkNodeId,
    };
  }

  static importDOM(): DOMConversionMap<HTMLDivElement> | null {
    return {
      div: (domNode: HTMLDivElement) => {
        if (!domNode.hasAttribute('data-lexical-github-code-id')) {
          return null;
        }
        return {
          conversion: convertGithubCodeElement,
          priority: 2,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-github-code-id', this.__id);
    element.setAttribute('data-lexical-github-document-id', this.__documentId);
    element.setAttribute('data-lexical-github-linkedMarkNode-id', this.__linkedMarkNodeId);
    return { element };
  }

  constructor(documentId: string, githubNodeId: string, mark_id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = githubNodeId;
    this.__documentId = documentId;
    this.__linkedMarkNodeId = mark_id;
    console.log(this.__id);
    
  }

  getId(): string {
    return this.__id;
  }

  isTopLevel(): true {
    return true;
  }
}

export function $createGithubCodeNode(payload: GithubCodeNodeInterface): GithubCodeNode {
  const { documentId, githubNodeId, mark_id } = payload;
  return new GithubCodeNode(documentId, githubNodeId, mark_id);
}

export function $isGithubCodeNode(node: GithubCodeNode | LexicalNode | null | undefined): node is GithubCodeNode {
  return node instanceof GithubCodeNode;
}