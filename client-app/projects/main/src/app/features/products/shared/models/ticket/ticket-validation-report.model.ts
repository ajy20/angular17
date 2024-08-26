import { Anomaly } from "./anomaly.model";

export interface TicketValidationReport {
  aggregateId: string;
  report: string;
  anomalies: Anomaly[]
}
