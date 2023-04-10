import { useCallback, useState, useLayoutEffect } from 'react';

import {
  $getNodeByKey,
  ElementFormatType,
  LexicalEditor,
  NodeKey,
} from 'lexical';

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

//import AceEditor from 'react-ace';

//import { FaProjectDiagram, FaChevronDown } from 'react-icons/fa';
//import { ClickAwayListener } from '@mui/material';

import { DIAGRAM_TEXT_LANGUAGE_MAP, DIAGRAM_TEXT_TEMPLATE_MERMAID, TemplateMermaidItem } from './DiagramNodeConstants';
import { $isDiagramTextNode } from './DiagramNode';
import Mermaid from './Mermaid';

export type DiagramComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  language: string;
  diagramDefinition: string;
  diagramTextEditor: LexicalEditor;
}>;

export function DiagramComponent({
  className,
  format,
  nodeKey,
  language = '',
  diagramDefinition = '',
  diagramTextEditor,
}: DiagramComponentProps) {
  const [editor] = useLexicalComposerContext();

  const [isEditable, setEditable] = useState(false);
  const [isDiagramTextEditorActive, setDiagramTextEditorActive] = useState(false);

  const setDiagramDefinition = useCallback(
    (newDefintion: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isDiagramTextNode(node)) {
          node.setDiagramDefinition(newDefintion);
        }
      });
    },
    [editor, nodeKey],
  );

  const setDiagramTemplate = (templateDefintion: string) => {
    setDiagramDefinition(templateDefintion);
  };

  useLayoutEffect(() => {
    setEditable(editor.isEditable());
    return editor.registerEditableListener((currentIsEditable) => {
      setEditable(currentIsEditable);
    });
  }, [editor]);

  return (
    null
  );
}

// DiagramViewer
export type DiagramViewerProps = Readonly<{
  viewType: string;
  content: string;
  isEditable: boolean;
}>;

export function DiagramViewer({ viewType, content, isEditable }: DiagramViewerProps) {
  switch (viewType) {
    case DIAGRAM_TEXT_LANGUAGE_MAP.mermaid:
      return null
    default:
      return null;
  }
}

// DiagramHeaderComponent
function DiagramHeader() {
  return (
    null
  );
}

// DiagramDropDown
function AddDiagramDropdown({ options, onSelect }: { options: Array<TemplateMermaidItem>; onSelect: (option: TemplateMermaidItem) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  const  closeDropdown = () => {
    setIsOpen(false);
  }

  function onSelectItem(item: TemplateMermaidItem) {
    closeDropdown();
    onSelect(item);
  }

  return (
    null
  );
}

export default DiagramComponent;
