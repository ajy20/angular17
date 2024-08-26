import { TicketValidationStatus } from "./ticket-validation-status.model";

export interface TicketValidation {
  instanceId: string;
  runTimeStatus: string;
  createdTime: Date;
  lastUpdateTime: Date
  customStatus: TicketValidationStatus[];
}
