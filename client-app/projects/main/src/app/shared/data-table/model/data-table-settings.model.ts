import { DataTableGroupBy } from "./data-table-group-by.model";
import { DataTableColumnDefinition } from "./data-table-column-definition.model";
import { DataTableToolbar } from "./data-table-toolbar.model";

export interface DataTableSettings<T> {
  data: T[];
  hideRow?: (row: any) => boolean;
  columnDefinitions: DataTableColumnDefinition[];
  toolBar?: DataTableToolbar;
  selectableRows?: boolean;
  cascadeParentSelectionToChildren?: boolean;
  draggableRows?: boolean;
  rowIdProperty?: string;
  groupBy: DataTableGroupBy[];
  defaultFilterValues?: string[][];
}
