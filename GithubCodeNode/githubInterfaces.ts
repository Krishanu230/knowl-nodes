import { CreatedByNode } from './coreAPIInterfaces';

export interface GithubNode {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  commit_sha: string;
  start_line: number;
  end_line: number;
  mark_id: string;
  status: GithubNodeStatus;
  document: string;
  modified: string;
  last_updated_by: CreatedByNode;
}

export const enum GithubNodeStatus {
  InSync = 1,
  OutOfSync = 2,
}

export interface GithubCodeNodePayload {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  commit_sha: string;
  start_line: number;
  end_line: number;
  mark_id: string;
  status: GithubNodeStatus;
}

export interface GithubCodeNodeInterface {
  documentId: string;
  githubNodeId: string;
  mark_id: string;
}

export interface LastModified {
  lastModifiedOn: string;
  lastModifiedBy: CreatedByNode;
}