import { Subject } from "rxjs";

export interface DataTableColumn {
  // The id of the column
  id: string;
  // The name of the property mapped to the column
  name: string;
  // The column header text
  label: string;
  // The type of data to show in the column
  type: 'text' | 'icon' | 'picture' | 'button';
  // The css class to apply to the column
  columnClass?: string;
  // The css class to apply to cells in the column
  cellClass?: string | ((data: any) => string);
  // The alignment of the cells in the column
  cellAlignment?: 'left' | 'center' | 'right';
  // The colspan for the column header
  colspan?: number;
  // Indicates whether the column is visible or not
  visible: boolean;
  // Indicates whether the column data can be searchable
  searchable: boolean;
  // The type of filter for the column
  // select: show a dropdown with a list of all values in the column
  // numeric: show an option form to filter based on typical numeric comparison: greater than, less than,...
  // text: free field text
  // icon: show a dropdown with a list of unique icons from the column
  // none: the column cannot be filtered
  filterMode: 'select' | 'numeric' | 'text' | 'icon' | 'none';
  // Used only when filterMode = select. Holds the list of all unique values in the column
  filterValues?: { value: string, selected: boolean }[];
  // The text to show in the filter
  filterText?: string;
  // The observable holding the currently selected filter values
  filterSubject$: Subject<string[]>;
  // The filter status
  filterStatus?: 'all' | 'indeterminate' | 'none';
  // Callback when a cell is clicked on
  click?: (data: any) => void;
}
