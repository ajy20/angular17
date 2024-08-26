import { TicketDocumentVersion } from './ticket-document-version.model';

export interface Ticket {
  id: string;
  productId: string;
  title: string;
  documentVersions: TicketDocumentVersion[];
  validationId: string;
  released: boolean;
  ecn: string;
  releaseDate: Date | null;
  createdOn: Date;
}
