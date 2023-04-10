export const enum DocType {
    Document = 1,
    Project = 2,
    DocumentBranch = 3,
  }
  
  export interface NewItemPayload {
    name: string;
    parent: string | null;
    doc_type: DocType;
  }
  
  export interface NewDocumentNodePayload extends NewItemPayload {
    doc_type: DocType.Document;
  }
  
  export interface NewProjectNodePayload extends NewItemPayload {
    doc_type: DocType.Project;
    parent: null;
  }
  
  export interface CreatedByNode {
    first_name: string;
    last_name: string;
  }
  export interface ItemNode {
    id: string;
    name: string;
    parent: string | null;
    doc_type: DocType;
    modified: string;
    created: string;
    children: DocumentNode[];
    isChildFetched: boolean;
    created_by: CreatedByNode;
    contributor_count: number;
  }
  
  export interface AncestorNode {
    id: string;
    name: string;
    tree_depth: number;
    doc_type: DocType;
  }
  
  export interface ItemNodeDetails extends ItemNode {
    ancestors: AncestorNode[];
  }
  
  export interface DocumentNode extends ItemNode {
    doc_type: DocType.Document;
  }
  
  export interface ProjectNode extends ItemNode {
    doc_type: DocType.Project;
    parent: null;
  }
  
  export interface ContributorNode {
    user: {
      first_name: string;
      last_name?: string;
    };
    modified: string;
    created: string;
    id: string;
  }
  
  export enum ContributorType {
    Owner,
    Editor,
  }
  
  export type TContributorDetail = {
    firstName: string;
    lastName: string;
    type: ContributorType;
  };