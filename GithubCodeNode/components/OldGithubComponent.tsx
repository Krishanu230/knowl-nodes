import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { useContext, useEffect } from 'react';
import { CoreAPIs } from 'src/api';
import { WorkspaceStatusContext } from 'src/contexts';
import { WorkspaceStatusType } from 'src/contexts/workspace/WorkspaceContext';
import { INSERT_GITHUB_CODE_COMMAND } from 'src/editor/plugins/GithubCodePlugin/GithubCodePlugin';
import { $isGithubCodeNode } from '../GithubCodeNode';
import isEmpty from 'lodash/isEmpty';

export default function OldGithubComponent({ payload, nodeKey }) {
  const { currentDocument } = useContext(WorkspaceStatusContext) as WorkspaceStatusType;
  const [editor] = useLexicalComposerContext();

  const saveOldNodeData = async (documentId: string) => {
    try {
      const res = await CoreAPIs.saveGithubCodeNode(documentId, payload);
      const githubNodeId = res.id;
      return editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isGithubCodeNode(node)) {
          node.remove();
          editor.dispatchCommand(INSERT_GITHUB_CODE_COMMAND, { documentId: documentId, githubNodeId: githubNodeId });
        }
      });
    } catch (error) {
      console.error('Something went wrong while migrating old github nodes :', error);
    }
  };

  useEffect(() => {
    if (currentDocument?.id && !isEmpty(payload)) {
      saveOldNodeData(currentDocument.id);
    }
  }, []);
  return null;
}
