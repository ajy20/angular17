import { TicketValidationReport } from "./ticket-validation-report.model";

export interface TicketValidationStatus {
  number: number;
  text: string;
  function: string;
  model: string;
  status: number;
  report: TicketValidationReport;
}
