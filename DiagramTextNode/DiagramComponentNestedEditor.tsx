import { useCallback, useEffect, useState, useLayoutEffect } from 'react';

import './DiagramNode.css';

import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  ElementFormatType,
  LexicalEditor,
  NodeKey,
  $getSelection,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCollaborationContext } from '@lexical/react/LexicalCollaborationContext';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
// import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';

import { FaProjectDiagram, FaChevronDown } from 'react-icons/fa';
import { ClickAwayListener } from '@mui/material';

import { createWebsocketProvider } from '../../collaboration';
import { useSettings } from '../../context/SettingsContext';
import { useSharedHistoryContext } from '../../context/SharedHistoryContext';
import TreeViewPlugin from '../../plugins/TreeViewPlugin';
import ContentEditable from '../../ui/ContentEditable';
import Placeholder from '../../ui/Placeholder';

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

  const { isCollabActive } = useCollaborationContext();
  const { historyState } = useSharedHistoryContext();
  const {
    settings: { showNestedEditorTreeView },
  } = useSettings();

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
    diagramTextEditor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(templateDefintion));
      root.append(paragraph);
      root.selectEnd();
    });
  };

  useLayoutEffect(() => {
    setEditable(editor.isEditable());
    return editor.registerEditableListener((currentIsEditable) => {
      setEditable(currentIsEditable);
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      diagramTextEditor.registerTextContentListener((textContent) => {
        setDiagramDefinition(textContent);
      }),
      diagramTextEditor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          const selection = $getSelection();
          setDiagramTextEditorActive(selection !== null);
        });
      })
    );
  }, [diagramTextEditor, setDiagramDefinition]);

  return (
    <BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
      <div className="p-1 border-slate-300 border-2 border-solid rounded">
        <DiagramHeader />
        <DiagramViewer viewType={language} content={diagramDefinition} isEditable={isEditable} />
        <div>
          <div className="flex items-center justify-between p-1">
            <span className="ml-1">Edit Diagram:</span>
            <div className="right-0 flex items-center inset-auto pr-0">
                <AddDiagramDropdown
                  options={DIAGRAM_TEXT_TEMPLATE_MERMAID}
                  onSelect={(item) => {
                    setDiagramTemplate(item.template);
                  }}
                />
            </div>
          </div>
        </div>
        <div className={`border-slate-300 border-2 border-solid rounded bg-slate-50 relative ${!isDiagramTextEditorActive ? 'h-20 overflow-y-scroll' : ''}`}>
          <LexicalNestedComposer initialEditor={diagramTextEditor}>
            {isCollabActive ? (
              <CollaborationPlugin
                id={diagramTextEditor.getKey()}
                providerFactory={createWebsocketProvider}
                shouldBootstrap
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            {/* <RichTextPlugin
              contentEditable={<ContentEditable className="DiagramNode__contentEditable" />}
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            /> */}
            {/* <CodeHighlightPlugin /> */}
            {/* <TabIndentationPlugin /> */}
            {/* <GithubCodePlugin /> */}
            {/* <FloatingTextFormatToolbarPlugin /> */}
            {/* <FloatingLinkEditorPlugin /> */}
            <PlainTextPlugin
              contentEditable={<ContentEditable className="outline-0 p-1 DiagramNode__contentEditable" />}
              placeholder={<Placeholder>Add Diagram Defintion</Placeholder>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {showNestedEditorTreeView === true ? <TreeViewPlugin /> : null}
          </LexicalNestedComposer>
        </div>
      </div>
    </BlockWithAlignableContents>
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
      return <div>{content && <Mermaid chart={content} />}</div>;
    default:
      return null;
  }
}

// DiagramHeaderComponent
function DiagramHeader() {
  return (
    <div className="flex items-center">
      <span className="h-4 w-4 inline-block">
        <FaProjectDiagram />
      </span>
      <span className="ml-1 font-bold">DIAGRAM</span>
    </div>
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
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={toggleDropdown}
        >
          Start With:
          <FaChevronDown className="-mr-1 h-4 w-4 text-gray-400" />
        </button>
      </div>
      {isOpen && (
      <ClickAwayListener onClickAway={closeDropdown}>
        <div
          className="absolute right-0 z-10 mt-0 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1" role="none">
            {options.map((item) => (
              <button
                type="button"
                key={item.name}
                className="text-gray-700 block px-4 py-2 text-sm"
                onClick={() => {
                  onSelectItem(item);
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        </ClickAwayListener>
      )}
    </div>
  );
}

export default DiagramComponent;
