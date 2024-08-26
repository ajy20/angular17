export interface BaseVersion {
  id: string;
  productId: string;
  documentId: string;
  documentName: string;
  ticketId: string;
  label: string;
  branchedFromVersionId: string;
  synchedWithVersionId: string;
  deleted: boolean;
  released: boolean;
  isLatestPublished: boolean;
  releaseDate: Date;
  statuses: { [key: string]: string; };
  lastModifiedOn: string;
  variants?: any;
  canResetWorkflow: boolean;
}
