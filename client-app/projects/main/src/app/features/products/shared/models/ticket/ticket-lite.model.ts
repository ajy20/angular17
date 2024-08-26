export interface TicketLite {
  id: string;
  productId: string;
  title: string;
  description: string;
  category: string;
  released: boolean;
  ecn: string;
  releaseDate: Date | null;
  validationId: string;
  createdOn: Date;
}
