export interface TicketDashboardTicket {
  id: string;
  productLine: { id: string, name: string };
  name: string;
  ecn?: string;
}
