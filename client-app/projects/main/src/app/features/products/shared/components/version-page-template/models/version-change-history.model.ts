export interface BaseVersionChangeHistory {
  id: string;
  changeItems: {
    description: string, details: string, occurredOn: Date, changedBy: { id: string, abbreviatedName: string, fullName: string, viaProcessId: string }
  }[];
}
