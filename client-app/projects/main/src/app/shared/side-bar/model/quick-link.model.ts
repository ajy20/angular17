export interface QuickLink {
  label: string;
  abbreviation: string;
  active?: boolean;
  onClick?: (e: QuickLink) => void;
  data: any;
}
