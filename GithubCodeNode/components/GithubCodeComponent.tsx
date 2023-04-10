import { PrimaryButton } from '@components/buttons';
import { CodeDiffViewer } from '@components/codeDiffViewer';
import { CodeEditor } from '@components/codeEditor';
import {
  GithubNodeError,
  GithubNodeLoader,
  GithubNodeUnauthenticated,
  GithubNodeInfoBar,
} from '@components/githubNode';
import { Modal } from '@components/modal';
import { CheckCircleIcon, ExclamationIcon } from '@heroicons/react/outline';
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { getGithubAccessToken } from '@utils/cookieUtils';
import { getFileExtension } from '@utils/githubUtils';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import get from 'lodash/get';
import { $getNodeByKey, ElementFormatType, NodeKey, $createTextNode } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as diff from 'diff';
import toast from 'react-hot-toast';
import { FaGithub, FaUnlink, FaPen, FaSync } from 'react-icons/fa';
import { CoreAPIs, GithubAPIs } from 'src/api';
import { GithubCodeNodePayload } from 'src/api/interfaces/githubInterfaces';
import useModal from 'src/editor/hooks/useModal';
import { InsertGithubDialog } from 'src/editor/plugins/ToolbarPlugin';
import Button from 'src/editor/ui/Button';
import { $isGithubCodeNode } from '../GithubCodeNode';
import ActionButton from './ActionButton';
import 'ace-builds/src-noconflict/theme-github';

const getCodeFromRange = (code: string, startLine: number = 0, endLine: number) => {
  if (startLine > endLine) return code;
  const requiredLines = code.split(/\r?\n/).slice(startLine - 1, endLine);
  return requiredLines.join('\n');
};

type CodeComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  loadingComponent?: JSX.Element | string;
  nodeKey: NodeKey;
  onError?: (error: string) => void;
  onLoad?: () => void;
  documentId: string;
  githubNodeId: string;
}>;

export default function CodeComponent({
  className,
  format,
  nodeKey,
  onError,
  onLoad,
  documentId,
  githubNodeId,
}: CodeComponentProps) {
  const [editor] = useLexicalComposerContext();
  const isUserGithubPreAuthenticate = getGithubAccessToken();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousGithubNodeRef = useRef<string>('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [codeblock, setCodeblock] = useState<string | null>(null);
  const [latestCommitId, setLatestCommitId] = useState<string | null>('');
  const [newCodeblock, setNewCodeblock] = useState<string | null>(null);
  const [isInSync, setIsInSync] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [showSyncOptions, toggleSyncOptions] = useState<boolean>(false);
  const [showSyncDiffPopup, toggleSyncDiffPopup] = useState<boolean>(false);
  const [modal, showModal] = useModal();
  const [owner, setOwner] = useState<string>('');
  const [repo, setRepo] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const [commitId, setCommitId] = useState<string>('');
  const [startLine, setStartLine] = useState<number>('');
  const [endLine, setEndLine] = useState<number>('');

  const createCodeNode = useCallback(async () => {
    try {
      setIsCodeLoading(true);
      const res = await CoreAPIs.getGithubCodeNodeDetails(documentId, githubNodeId);
      const { owner, repo, branch, path, commit_sha: commitId, start_line, end_line } = res;
      setOwner(owner);
      setRepo(repo);
      setBranch(branch);
      setPath(path);
      setCommitId(commitId);
      setStartLine(start_line);
      setEndLine(end_line);

      await getFileContent({ owner, repo, branch, path, commit_sha: commitId, start_line, end_line });
    } catch (error) {
      if (onError) {
        onError(String(error));
      }
    } finally {
      setIsCodeLoading(false);
    }
  }, [onError, onLoad]);

  useEffect(() => {
    if (documentId && githubNodeId) {
      createCodeNode();
    }
  }, []);

  const getContent = async (
    owner: string,
    repo: string,
    path: string,
    commitId: string,
    startLine: number,
    endLine: number
  ) => {
    try {
      const res = await GithubAPIs.getFileContent(owner, repo, path, commitId);
      const encoded: string | undefined = res.content;
      if (encoded) {
        const decoded = atob(encoded);
        const requestCodeBlock = getCodeFromRange(decoded, startLine, endLine);
        return requestCodeBlock;
      } else {
        setIsError(true);
        return undefined;
      }
    } catch (error) {
      setIsError(true);
      return undefined;
    }
  };

  const getFileContent = async ({
    owner,
    repo,
    branch,
    path,
    commit_sha,
    start_line,
    end_line,
  }: GithubCodeNodePayload) => {
    try {
      setIsCodeLoading(true);
      const currentNodeSavedContent: string | undefined = await getContent(
        owner,
        repo,
        path,
        commit_sha,
        start_line,
        end_line
      );
      if (currentNodeSavedContent !== undefined) {
        setCodeblock(currentNodeSavedContent);
        setIsError(false);
      } else {
        setIsError(true);
      }

      const res2 = await GithubAPIs.fetchBranchInfo(owner, repo, branch);
      const newCommitId = get(res2, 'commit.sha', null);
      setLatestCommitId(newCommitId);

      if (newCommitId !== commitId && newCommitId !== null) {
        const newContent: string = await getContent(owner, repo, path, newCommitId, start_line, end_line);
        setNewCodeblock(newContent);
        const differenceInCode = diff.diffWords(currentNodeSavedContent, newContent);
        setIsInSync(differenceInCode.length === 1);
      } else {
        setIsInSync(true);
      }
      setIsCodeLoading(false);
    } catch (error) {
      console.error('Unable to fetch github node content :', error);
    }
  };

  const showOptions = () => {
    toggleSyncOptions(!showSyncOptions);
  };

  const onDeleteGithubNode = async () => {
    try {
      await CoreAPIs.deleteGithubCodeNode(documentId, githubNodeId);
      return editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isGithubCodeNode(node)) {
          node.remove();
        }
      });
    } catch (error) {
      console.error('Unable to delete Github node :', error);
    }
  };

  //   const onDeleteGithubNode = useCallback(
  //     async (payload: any) => {
  //       if (isSelected) {
  //         const event: KeyboardEvent = payload;
  //         event.preventDefault();
  //         editor.update(async () => {
  //           const node = $getNodeByKey(nodeKey);
  //           console.log('$isGithubCodeNode(node', $isGithubCodeNode(node), node);
  //           if ($isGithubCodeNode(node)) {
  //             await CoreAPIs.deleteGithubCodeNode(documentId, githubNodeId);
  //             node.remove();
  //           }
  //           setSelected(false);
  //         });
  //       }
  //       return false;
  //     },
  //     [editor, isSelected, nodeKey, setSelected]
  //   );

  const syncAndUpdateGithubNode = () => {
    const payload: GithubCodeNodePayload = {
      owner,
      repo,
      path,
      branch,
      commit_sha: latestCommitId,
      start_line: startLine,
      end_line: endLine,
    };
    updateNode(payload);
  };

  const onEditGithubNode = () => {
    if (repo && branch) {
      showModal('Update your linked code', (onClose) => (
        <InsertGithubDialog
          activeEditor={editor}
          onClose={onClose}
          defaultSelectedRepo={repo}
          defaultSelectedBranch={branch}
          onUpdate={updateNode}
        />
      ));
    }
  };

  const updateNode = async (payload: GithubCodeNodePayload) => {
    const res = await CoreAPIs.updateGithubCodeNode(documentId, githubNodeId, payload);
    const { owner, repo, branch, path, commit_sha: commitId, start_line, end_line } = res;
    setOwner(owner);
    setRepo(repo);
    setBranch(branch);
    setPath(path);
    setCommitId(commitId);
    setStartLine(start_line);
    setEndLine(end_line);

    await getFileContent({ owner, repo, branch, path, commit_sha: commitId, start_line, end_line });
    toggleSyncDiffPopup(false);
    toast.success('Github code successfully updated');
  };

  //   useEffect(() => {
  //     return mergeRegister(
  //       editor.registerCommand(KEY_DELETE_COMMAND, onDeleteGithubNode, COMMAND_PRIORITY_LOW),
  //       editor.registerCommand(KEY_BACKSPACE_COMMAND, onDeleteGithubNode, COMMAND_PRIORITY_LOW)
  //     );
  //   }, [clearSelection, editor, onDeleteGithubNode]);

  return (
    <>
      {modal}
      <BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
        {isError && <GithubNodeError />}
        {isUserGithubPreAuthenticate && isCodeLoading && <GithubNodeLoader />}
        {!isUserGithubPreAuthenticate && (
          <GithubNodeUnauthenticated owner={owner} branch={branch} repo={repo} path={path} />
        )}
        {isUserGithubPreAuthenticate && codeblock && !isCodeLoading && (
          <div
            className={clsx(
              !isInSync && !isCodeLoading ? '' : undefined,
              'flex flex-col shadow-xl rounded-3xl bg-[#F8FAFF] overflow-hidden py-2 px-4 gap-y-2'
            )}
          >
            <GithubNodeInfoBar owner={owner} branch={branch} repo={repo} path={path} />
            {!isError && isInSync ? (
              <CodeEditor
                readOnly={true}
                startLine={startLine}
                endLine={endLine}
                code={codeblock}
                onSelectionChange={() => {}}
                type={path ? getFileExtension(path) : 'js'}
              />
            ) : (
              newCodeblock && <CodeDiffViewer oldFile={codeblock} newFile={newCodeblock} />
            )}

            <div className="flex justify-between items-center px-4 py-2">
              {isInSync ? (
                <div className="flex justify-start items-center gap-x-2">
                  <CheckCircleIcon className="text-green-600 w-5 h-5" />
                  <span className="text-xs text-green-600 font-bold">Code and document are In Sync</span>
                </div>
              ) : (
                <div className="flex justify-between items-center gap-x-2">
                  <div className="flex justify-start items-center gap-x-2">
                    <ExclamationIcon className="text-red-500 w-4 h-4" />
                    <span className="text-xs text-red-500 font-bold">
                      Out of Sync, the code and doc are out of sync.
                    </span>
                  </div>
                </div>
              )}
              <Button onClick={showOptions}>
                <FaGithub className="w-4 h-4 text-gray-700 rounded-full" />
              </Button>
            </div>

            <AnimatePresence>
              {showSyncOptions && (
                <div className="flex flex-col justify-start items-start px-4 py-2 gap-y-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 30 }}
                    exit={{ height: 30 }}
                    transition={{ duration: 0.1 }}
                    className="flex justify-start items-center gap-x-2 mb-2"
                  >
                    <ActionButton
                      onClick={onDeleteGithubNode}
                      text="Unlink"
                      icon={<FaUnlink className="w-3 h-3 text-gray-500" />}
                    />
                    <ActionButton
                      onClick={onEditGithubNode}
                      text="Edit"
                      icon={<FaPen className="w-3 h-3 text-gray-500" />}
                    />
                    {!isInSync && (
                      <ActionButton
                        onClick={() => toggleSyncDiffPopup(true)}
                        text="Review and sync"
                        icon={<FaSync className="w-3 h-3 text-gray-500" />}
                      />
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
        <Modal isOpen={showSyncDiffPopup} onClose={() => toggleSyncDiffPopup(false)}>
          <div className="flex flex-col justify-start gap-4 p-2 w-full">
            <div className="font-semibold text-gray-600">Review and Sync</div>
            <div className="flex justify-center items-center w-full overflow-x-scroll">
              {codeblock && newCodeblock && <CodeDiffViewer oldFile={codeblock} newFile={newCodeblock} />}
            </div>
            <div className=" flex justify-end items-center">
              <PrimaryButton onClick={syncAndUpdateGithubNode}>Sync Code</PrimaryButton>
            </div>
          </div>
        </Modal>
        <div style={{ display: 'inline-block', width: '550px' }} ref={containerRef} />
      </BlockWithAlignableContents>
    </>
  );
}
