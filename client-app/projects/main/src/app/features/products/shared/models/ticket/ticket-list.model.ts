import { TicketLite } from './ticket-lite.model';

export interface TicketList {
  id: string;
  productId: string;
  tickets: TicketLite[];
  canAuthor: boolean;
}
