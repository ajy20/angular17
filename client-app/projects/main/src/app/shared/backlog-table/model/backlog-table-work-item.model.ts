export interface BacklogTableWorkItem {
  id: string;
  name: string;
  productLine: { id: string, name: string };
  epic: { id: string, name: string };
  feature: { id: string, name: string };
  story: { id: string, name: string };
  //effort: number;
  //plannedCompletionDate: Date;
  //actualCompletionDate: Date | null;
}
