import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { DataTableCell } from "./data-table-cell.model";

export type DataTableRow<T> = T & {
  rowId: any;
  cells: DataTableCell[];
  class?: string;
  level: number;
  selectable: boolean;
  selected: boolean;
  selectedIcon: IconDefinition;
  physicalIndex: number;
  expandable: boolean;
  expanded: boolean;
  expandedIcon: IconDefinition;
  error: boolean;
  errorMessage: string;
}
