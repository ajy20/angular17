export interface TicketDocumentVersion {
  versionId: string;
  productId: string;
  documentId: string;
  documentLabel: string;
  ticketId: string;
  versionLabel: string;
  deleted: boolean;
  released: boolean;
  workflowId: string;
  statuses: { [key: string]: string; };
  type: string;
  isNestedDocument: boolean;
  lastModifiedOn: Date;
  nestedVersions: TicketDocumentVersion[];
  variants: { id: string, name: string }[];
}
