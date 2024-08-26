export interface DataTableGroupBy {
  // The property used for grouping
  property: string;
  // The properties used for ordering the groups
  orderBy: string[];
  // Indicates whether to show the group if the groupBy property value is undefined
  showUndefined?: boolean;
  // The css class to apply to the group by row
  rowClass?: string | ((data: any) => string);
  // The mapping of group properties to data table columns
  columns: {
    name: string,
    excelLabel?: string,
    type: 'text' | 'icon' | 'picture' | 'button',
    class?: string | ((data: any) => string),
    alignment?: 'left' | 'center' | 'right',
    colspan: number,
    searchable?: boolean,
    excludeFromExcelExport?: boolean;
    click?: (data: any) => void;
  }[];
}
