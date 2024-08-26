export interface BurnDownChartTask {
  id: string;
  name: string;
  effort: number;
  plannedCompletionDate: Date;
  actualCompletionDate: Date | null;
}
