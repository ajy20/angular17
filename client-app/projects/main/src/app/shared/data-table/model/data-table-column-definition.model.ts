export interface DataTableColumnDefinition {
  id: string;
  name: string;
  label: string;
  excelLabel?: string;
  type: 'text' | 'icon' | 'picture' | 'button';
  columnClass?: string;
  columnColspan?: number;
  cellClass?: string | ((data: any) => string);
  cellAlignment?: 'left' | 'center' | 'right';
  visible: boolean;
  searchable: boolean;
  filterMode: 'select' | 'numeric' | 'text' | 'icon' | 'none';
  excludeFromExcelExport?: boolean;
  click?: (data: any) => void;
}
