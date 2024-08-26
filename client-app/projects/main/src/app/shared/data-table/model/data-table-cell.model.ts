export interface DataTableCell {
  value: any;
  type: 'text' | 'icon' | 'picture' | 'button';
  class: string;
  alignment: 'left' | 'center' | 'right';
  prop: string;
  colspan: number;
  canClick: boolean;
  click: () => void;
}
