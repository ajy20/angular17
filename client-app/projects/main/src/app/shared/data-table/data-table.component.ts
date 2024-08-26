import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSquare, faSquare as faSquare2 } from '@fortawesome/free-regular-svg-icons';
import { faCaretDown, faCaretRight, faCaretUp, faCheckSquare, faExclamationCircle, faFileExcel, faFilePdf, faFilter, faGripVertical, faMinusSquare, faSquareMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { VirtualScrollerComponent, VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { HighlightPipe } from '../highlight-pipe/highlight.pipe';
import { SecurePipe } from '../secure-pipe/secure.pipe';
import { DataTableBaseData } from './model/data-table-base-data.model';
import { DataTableCell } from './model/data-table-cell.model';
import { DataTableColumnDefinition } from './model/data-table-column-definition.model';
import { DataTableColumn } from './model/data-table-column.model';
import { DataTableGroupBy } from './model/data-table-group-by.model';
import { DataTableRow } from './model/data-table-row.model';
import { DataTableSettings } from './model/data-table-settings.model';
import { DataTableToolbarControl } from './model/data-table-toolbar-control.model';
import { DataTableToolbar } from './model/data-table-toolbar.model';

@Component({
  selector: 'csps-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, CdkDropListGroup, CdkDropList, CdkDrag, VirtualScrollerModule, NgbDropdownModule, HighlightPipe, SecurePipe],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent<T extends DataTableBaseData> implements OnInit, OnChanges, OnDestroy {
  // Reference to the virtual scroller component
  @ViewChild(VirtualScrollerComponent) virtualScroller!: VirtualScrollerComponent;

  // The data table settings
  @Input() settings!: DataTableSettings<T>;

  // The event emitted when an item is moved
  @Output() itemMoved: EventEmitter<any> = new EventEmitter<any>();

  // The event emitted when a filter is updated
  @Output() filterChanged: EventEmitter<any> = new EventEmitter<any>();

  // Icons
  faSquare: IconDefinition = faSquare;
  faSquare2: IconDefinition = faSquare2;
  faCheckSquare: IconDefinition = faCheckSquare;
  faMinusSquare: IconDefinition = faMinusSquare;
  faCaretRight: IconDefinition = faCaretRight;
  faCaretUp: IconDefinition = faCaretUp;
  faCaretDown: IconDefinition = faCaretDown;
  faExclamationCircle: IconDefinition = faExclamationCircle;
  faFilter: IconDefinition = faFilter;
  faFileExcel: IconDefinition = faFileExcel;
  faFilePdf: IconDefinition = faFilePdf;
  faGripVertical: IconDefinition = faGripVertical;

  // The list of data columns and the corresponding list curated to account for colspans
  columns: DataTableColumn[] = [];
  spanningColumns: DataTableColumn[] = [];

  // The list of unique column values
  uniqueColValues!: { [key: string]: any };

  // The data source
  dataSource!: T[];

  // The column definitions
  columnDefinitions: DataTableColumnDefinition[] = [];

  // Indicates whether rows are selectable, expandable, draggable or any row has an error
  selectableRows: boolean = false;
  expandableRows: boolean = false;
  draggableRows: boolean = false;
  errors: boolean = false;

  // The property name used to uniquely identify a row
  rowIdProperty!: string;

  // The list of rows and their visible and filtered subset
  rows!: DataTableRow<T>[];
  visibleRows!: DataTableRow<T>[];
  filteredRows!: DataTableRow<T>[];

  // The toolbar
  toolbar!: DataTableToolbar | undefined;

  // Expanded status
  allExpanded: boolean = true;
  allExpandedIcon: IconDefinition = faCaretDown;

  // Selection status
  allSelected: boolean = false;
  anySelected: boolean = false;
  allSelectedIcon: IconDefinition = faSquare;

  // Select counter
  selectedRowCounter: number = 0;

  // Holds search text entered by user
  searchSubject$ = new Subject<string>();
  searchText: string = '';
  searchFoundIndex: number = 0;

  // Indicates whether to show filter row
  showFilterRow: boolean = false;

  // Selected, collapsed and filter caches
  selectedCache: { [key: string]: boolean } = {};
  collapsedCache: { [key: string]: boolean } = {};
  filterCache: string[][] = [];

  private FILTER_CACHE_ALL_SELECTED: string = "**ALL**";

  // Used for cleaning up subscription
  private unsubscribe: Subject<void> = new Subject();

  constructor() { }

  ngOnInit(): void {
    this.searchSubject$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe)
    ).subscribe(x => this.scrollTo(x, 0, 1));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Build filter cache only if change is applied on filter
    if (changes?.['settings']?.currentValue?.['defaultFilterValues']?.length && JSON.stringify(changes?.['settings']?.currentValue?.['defaultFilterValues']) !== JSON.stringify(changes?.['settings']?.previousValue?.['defaultFilterValues'])) {
      this.filterCache = changes['settings'].currentValue['defaultFilterValues'];
      if (!this.showFilterRow) this.toggleFilterRow();
    }

    this.buildRows();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  // Generate the list of all "physical rows" and columns for the table
  buildRows(): void {
    // Extract columns from the column definition settings and keep only visible ones
    this.columns = this.settings.columnDefinitions
      .filter(c => c.visible)
      .map(c => ({ ...c, cellAlignment: c.cellAlignment || 'center', colspan: c.columnColspan || 1, filterSubject$: new Subject<string[]>() }));

    // Extract the list of columns curated for colspans
    let skip = 0;
    this.spanningColumns = this.columns.reduce((acc, x) => {
      if (x.colspan && x.colspan > 1) {
        skip = x.colspan - 1;
        acc.push(x);
      } else if (skip === 0) {
        acc.push(x);
      }
      else {
        skip -= 1;
      }
      return acc;
    }, new Array<DataTableColumn>());

    // Create temporary object to store unique column values
    this.uniqueColValues = this.columns
      .filter(c => c.filterMode === 'select' || c.filterMode === 'numeric' || c.filterMode === 'icon')
      .reduce<{ [key: string]: any }>((acc, c) => {
        c.filterValues = [];
        acc[c.name] = {};
        return acc;
      }, {});

    // EXtract the toolbar
    this.toolbar = this.settings.toolBar;

    // Set the row Id property
    const rowIdProperty = this.settings.rowIdProperty || 'id';

    // Perform grouping if required and create rows
    if (this.settings.groupBy?.length)
      this.rows = this.groupRows(this.settings.data.map(d => ({ ...d, rowId: d[rowIdProperty] })), this.settings.hideRow || ((row: any) => false), this.settings.groupBy);
    else {
      this.rows = this.settings.data.map((d, i) => this.createRow({ ...d, level: 1, rowId: d[rowIdProperty] }, i));
    }

    // Sort filter values
    this.columns.filter(c => c.filterValues).forEach(c => {
      c.filterValues?.sort((a, b) => a.value > b.value ? 1 : (a.value < b.value ? -1 : 0));
    });

    // Subscribe to filter event emitters, setting their default values to an empty array
    const observables = this.columns.map((x, i) => x.filterSubject$.pipe(startWith([])));

    // TODO Cedric Do we need to kill the subscription on ngOnChanges?
    combineLatest(...observables).pipe(
      debounceTime(700),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe)
    ).subscribe(x => this.filterRows(x));

    // Reset the filter
    this.resetFilter(this.filterCache);

    // Build visible rows
    this.buildVisibleRows();

    // Make the rows draggable as specified
    this.draggableRows = !!this.settings.draggableRows;
  }

  // Extract from the list of rows, only those that are not collapsed
  buildVisibleRows() {
    // Visual rows are only those rows that are not collapsed
    let collapsedLevel = 99;
    this.visibleRows = this.rows.reduce((acc: DataTableRow<T>[], x) => {
      if (x.level <= collapsedLevel) {
        acc.push(x);
        collapsedLevel = !x.expanded ? x.level : 99;
      }
      return acc;
    }, []);

    // Force rows to filter
    if (this.showFilterRow)
      this.refreshFilter();
    else
      this.filteredRows = this.visibleRows;

    // Compute table level info
    this.errors = this.visibleRows.some(x => x.error);
    this.selectableRows = this.visibleRows.some(x => x.selectable);
    this.expandableRows = this.visibleRows.some(x => x.expandable);
  }


  // Group rows based on the provided list of properties
  groupRows(data: T[], hideRow: (row: any) => boolean, properties: DataTableGroupBy[]): DataTableRow<T>[] {
    // Helper method: multiPropertySorter
    // A multi-property sorted allowing for an array to be sorted based on multiple properties
    const multiPropertySorter: (props: string[]) => (a: any, b: any) => number = (props: string[]) => {
      return (a: any, b: any) => {
        for (let i = 0; i < props.length; i++) {
          const aVal = this.getPropertyByStringPath(a, props[i]);
          const bVal = this.getPropertyByStringPath(b, props[i]);
          if (aVal !== bVal)
            return aVal > bVal ? 1 : -1;
        }
        return 0;
      }
    }

    // Helper function: groupBy
    // Group an array by a specified property
    const groupBy: (arr: any[], prop: { key: string, orderBy: string[], groupProperties: string[] }) => { [key: string]: { info: any, values: any[] } } = (arr: any[], prop: { key: string, orderBy: string[], groupProperties: string[] }) => {
      return arr.reduce((acc, x) => {
        const keyVal = this.getPropertyByStringPath(x, prop.key);
        if (!acc[keyVal]) {
          acc[keyVal] = {
            info: [prop.key, ...prop.orderBy, ...prop.groupProperties].reduce((acc2, y) => {
              // Get the value
              const v = this.getPropertyByStringPath(x, y);
              // Deal with nested properties
              const nestedProps = y.split('.');
              nestedProps.reduce((o, p, i) => { o[p] = o[p] || (i === nestedProps.length - 1 ? v : {}); return o[p]; }, acc2);
              // Set the property key value as the row Id
              if (y === prop.key)
                acc2.rowId = v;
              // Return
              return acc2;
            }, {} as any),
            values: []
          }
        }
        acc[keyVal].values.push(x);
        return acc;
      }, {});
    };

    // Helper function: nest
    // Perform multi-level group by on a source array and return the grouped sorted array
    // arr: The array to perform group by upon
    // props: The list of prop to use for group by
    // level: The depth in the grouped array
    // parent: The parent group. Null if it does not exist
    const nest: (arr: any[], props: { key: string, orderBy: string[], showUndefined: boolean, groupProperties: string[] }[], level: number, parent: any) => any[] = (arr: any[], props: { key: string, orderBy: string[], showUndefined: boolean, groupProperties: string[] }[], level: number, parent: any) => {
      if (!props || !props.length)
        return arr.map(x => ({ ...x, level: level, parent: parent }));
      const [prop, ...others] = props;
      const group = groupBy(arr, prop);
      return Object.keys(group)
        .filter(x => prop.showUndefined || x !== 'undefined')
        .reduce((acc: any[], k) => { acc.push({ ...group[k].info, level: level, parent: parent, values: nest(group[k].values, others, level + 1, group[k].info) }); return acc; }, [])
        .sort(multiPropertySorter(prop.orderBy));
    };

    // Helper method: traverseDepthFirst
    // Traverse the nested arrays depth first
    const traverseDepthFirst: (arr: any[], childrenProperty: string, cb: (x: any) => void) => void = (arr: any[], childrenProperty: string, cb: (x: any) => void) => {
      // Make a copy of the array
      const stack = arr.slice(0);
      // Traverse the nested arrays
      while (stack.length) {
        // Shift element from stack
        var element = stack.shift();

        // Invoke callback
        cb(element);

        // Add child element to stack if they exist
        element && element[childrenProperty] && stack.unshift(...element[childrenProperty]);
      }
    }

    // Nest the rows
    const nestedRows = nest(data, properties.map(x => ({ key: x.property, orderBy: x.orderBy, showUndefined: !!x.showUndefined, groupProperties: x.columns.map(y => y.name) })), 1, null);

    // Reset the rows array
    const rows: DataTableRow<T>[] = [];

    // Traverse the nested rows and build the data table rows
    traverseDepthFirst(nestedRows, 'values', (r) => {
      if (!hideRow(r))
        rows.push(this.createRow(r, rows.length));
    });

    // Return
    return rows;
  }


  // Create row
  createRow(data: T & { level: number, rowId: any }, index: number): DataTableRow<T> {
    const groupByRowClass = data.level > this.settings.groupBy.length ? null : this.settings.groupBy[data.level - 1].rowClass;
    return {
      ...data,
      physicalIndex: index,
      selectable: !!this.settings.selectableRows,
      selected: !!this.selectedCache[data.rowId],
      selectedIcon: !!this.selectedCache[data.rowId] ? faCheckSquare : this.faSquare2,
      expandable: data.level <= this.settings.groupBy.length,
      expanded: !this.collapsedCache[data.rowId],
      expandedIcon: !this.collapsedCache[data.rowId] ? faCaretDown : faCaretRight,
      error: false, // TODO  
      errorMessage: '', // TODO
      class: data.level > this.settings.groupBy.length ?
        (typeof data.rowClass === 'function' ? data.rowClass() : data.rowClass) || '' :
        (typeof groupByRowClass === 'function' ? groupByRowClass(data) : groupByRowClass) || '',
      // TODO: Clean up functions below
      cells: data.level > this.settings.groupBy.length ? this.columns.map(c => {
        // Compute cell value
        const val = this.getPropertyByStringPath(data, c.name);

        // Add value to column filter value and mark them as selected by default
        if ((c.filterMode === 'select' || c.filterMode === 'numeric') && c.filterValues && !this.uniqueColValues[c.name][val]) {
          this.uniqueColValues[c.name][val] = true;
          c.filterValues.push({ value: val, selected: true });
        }

        // Add values of icon into column filter and mark them as selected by default
        if (c.filterMode === 'icon' && c.filterValues && !this.uniqueColValues[c.name][val.iconName]) {
          this.uniqueColValues[c.name][val.iconName] = true;
          c.filterValues.push({ value: val.iconName, selected: true });
        }

        // Return
        return {
          value: val,
          type: c.type,
          class: (typeof c.cellClass === 'function' ? c.cellClass(data) : c.cellClass) || '',
          alignment: c.cellAlignment || 'center',
          prop: c.name,
          colspan: 1,
          canClick: !!c.click,
          click: () => { if (c.click) c.click(data); }
        }
      }) :
        this.settings.groupBy[data.level - 1].columns.map(c => {
          // Compute cell value
          const val = this.getPropertyByStringPath(data, c.name);

          // Return
          return {
            value: val,
            type: c.type,
            class: (typeof c.class === 'function' ? c.class(data) : c.class) || '',
            alignment: c.alignment || 'center',
            prop: c.name,
            colspan: c.colspan,
            canClick: !!c.click,
            click: () => { if (c.click) c.click(data); }
          }
        })
    }
  }




  // ---------------------------------------------------
  // Selection
  // ---------------------------------------------------
  // Toggle all selections
  toggleSelectionAll(forceSelectionTo?: boolean): void {
    if (forceSelectionTo === undefined) {
      if (this.allSelected === true)
        this.clearSelection();
      else
        this.selectAll();
    }
    else if (forceSelectionTo === true) {
      this.selectAll();
    }
    else {
      this.clearSelection();
    }
  }

  // Toggle single row selection
  toggleRowSelection(row: DataTableRow<T>): void {
    if (row.selected)
      this.unselectRow(row);
    else
      this.selectRow(row);

    // Cascade to children
    if (this.settings.cascadeParentSelectionToChildren)
      this.cascadeSelectionToChildren(row);

  }

  // Clear all selections
  clearSelection(): void {
    this.filteredRows.forEach(r => {
      r.selected = false;
      r.selectedIcon = faSquare;
    });
    this.allSelected = false;
    this.anySelected = false;
    this.allSelectedIcon = faSquare;
    this.selectedRowCounter = 0;
  }

  // Select all rows
  selectAll(): void {
    this.filteredRows.forEach(r => {
      r.selected = true;
      r.selectedIcon = faCheckSquare;
    });
    this.allSelected = true;
    this.anySelected = true;
    this.allSelectedIcon = faCheckSquare;
    this.selectedRowCounter = this.filteredRows.length;
  }

  // Unselect a row
  unselectRow(row: DataTableRow<T>): void {
    row.selected = false;
    row.selectedIcon = faSquare;

    this.allSelected = false;
    this.anySelected = this.rows.some(r => r.selected);

    this.allSelectedIcon = this.anySelected ? faSquareMinus : faSquare;
    this.selectedRowCounter--;
  }

  // Select a single row
  selectRow(row: DataTableRow<T>): void {
    row.selected = true;
    row.selectedIcon = faCheckSquare;

    this.allSelected = this.rows.every(r => r.selected);
    this.anySelected = true;

    this.allSelectedIcon = this.allSelected ? faCheckSquare : faSquareMinus;
    this.selectedRowCounter++
  }

  // Toggle children selection
  cascadeSelectionToChildren(row: DataTableRow<T>): void {
    let i = row.physicalIndex + 1;
    const level = row.level;
    while (i < this.rows.length && this.rows[i].level > level) {
      this.rows[i].selected = row.selected;
      this.rows[i].selectedIcon = this.rows[i].selected ? faCheckSquare : this.faSquare;
      this.selectedCache[this.rows[i].rowId] = row.selected;
      i++;
    }

    if (row.selected) {
      this.allSelected = this.rows.every(r => r.selected);
      this.allSelectedIcon = this.allSelected ? faCheckSquare : faSquareMinus;
    } else {
      this.anySelected = this.rows.some(r => r.selected);
      this.allSelectedIcon = this.anySelected ? faSquareMinus : faSquare;
    }

    this.selectedRowCounter = this.rows.filter(r => r.selected).length;
  }

  // ---------------------------------------------------
  // Expand
  // ---------------------------------------------------
  // Toggle expansion status for all rows
  toggleExpansionAll() {
    this.allExpanded = !this.allExpanded;
    this.allExpandedIcon = this.allExpanded === true ? faCaretDown : faCaretRight;

    this.rows.forEach(x => {
      x.expanded = this.allExpanded;
      x.expandedIcon = x.expanded === true ? faCaretDown : faCaretRight;
      this.collapsedCache[x.rowId] = !x.expanded;
    });

    this.buildVisibleRows();
  }

  // Toggle expansion status for a single row
  toggleExpansion(row: DataTableRow<T>) {
    row.expanded = !row.expanded;
    row.expandedIcon = row.expanded === true ? faCaretDown : faCaretRight;
    this.collapsedCache[row.rowId] = !row.expanded;

    if (!row.expanded)
      this.allExpanded = false;
    else
      this.allExpanded = this.rows.every(x => x.expanded);

    this.allExpandedIcon = this.allExpanded === true ? faCaretDown : faCaretRight;
    this.buildVisibleRows();
  }

  // ---------------------------------------------------
  // Search
  // ---------------------------------------------------


  // Locate the first occurence of the search text and scroll to that corresponding item
  scrollTo(searchText: string, startIndex: number, direction: number): void {
    // Exit if searchText is null
    if (!searchText)
      return;

    // Default direction is forward
    direction = direction || 1;

    // Ensure startIndex is valid
    startIndex = startIndex || 0;

    // Convert searchText to lowercase for easier search
    searchText = searchText.toLowerCase();

    // Build search predicate
    const cols = this.settings.columnDefinitions.filter(x => x.searchable && x.visible);
    const groupedByCols = this.settings.groupBy.reduce((acc, x) => { acc.push(...x.columns.filter(y => y.searchable)); return acc; }, new Array<any>());
    const allSearchableColumns = cols.concat(groupedByCols);
    const predicate = (x: { cells: DataTableCell[] }) => allSearchableColumns.some(c => (x.cells.find(y => y.prop === c.name)?.value || '').toLowerCase().includes(searchText));

    // Locate the index of the first element that matches the search text
    const idx = direction === 1 ?
      this.visibleRows.slice(startIndex).findIndex(predicate) + startIndex :
      this.visibleRows.slice(0, startIndex).map(predicate).lastIndexOf(true);

    if (idx > -1) {
      this.searchFoundIndex = idx;
      const item = this.visibleRows[this.searchFoundIndex];
      this.virtualScroller.scrollInto(item, true, -34);
    }
  }

  // Find the next occurence of the search text and scroll to that corresponding item
  findNext(): void {
    this.scrollTo(this.searchText, this.searchFoundIndex + 1, 1);
  }

  // Find the previous occurence of the search text and scroll to that corresponding item
  findPrevious(): void {
    this.scrollTo(this.searchText, this.searchFoundIndex, -1);
  }


  // ---------------------------------------------------
  // Filter
  // ---------------------------------------------------


  // Toggle the filter row
  toggleFilterRow(): void {
    this.showFilterRow = !this.showFilterRow;

    if (!this.showFilterRow) {
      // Reset the filter
      this.resetFilter();
      // Allow drag and drop
      this.draggableRows = !!this.settings.draggableRows;
    }
    else {
      // Disabled drag and drop when filtering the table
      this.draggableRows = false;
    }
  }

  // Filter the rows based on the provided filter
  filterRows(filter: any[][]): void {
    // Update the filter cache
    this.filterCache = filter;

    // Filter the rows
    const filterPredicate = (x: DataTableRow<T>) =>
      x.level <= this.settings.groupBy.length ||
      this.columns
        .every((c, i) =>
          !filter[i] ||
          !filter[i].length ||
          filter[i][0] === this.FILTER_CACHE_ALL_SELECTED ||
          filter[i].some(y =>
            c.filterMode === 'numeric' || c.filterMode === 'select' || c.filterMode === 'icon' ?
              (c.filterMode === 'icon' ? x.cells[i].value.iconName === y : x.cells[i].value === y) :
              (x.cells[i].value || '').toLowerCase().includes(y.toLowerCase()))
        )

    this.filteredRows = this.visibleRows.filter(filterPredicate);

    // Remove selection of non-visible rows
    this.rows.filter(r => r.selected && !this.filteredRows.includes(r)).forEach(r => this.toggleRowSelection(r));
    // TODO: Remove group rows if content is empty

    // Emit filter changes
    if (this.showFilterRow) this.filterChanged.emit({ data: this.filterCache });
  }

  // Process filter value for fields with a free text filter
  processFilterValue(col: DataTableColumn, value: string) {
    // Update the filter text
    col.filterText = value;

    // Emit
    col.filterSubject$.next([value]);
  }

  // Toggle filter value for fields with dropdown filter
  toggleFilterValue(col: DataTableColumn, filterValue: { value: string, selected: boolean }): void {
    // Update the selected value status
    filterValue.selected = !filterValue.selected;

    // Update the filter
    this.updateSelectFilter(col);
  }

  // Toggle selection of all values in a given filter
  toggleSelectAllFilterValues(col: DataTableColumn) {
    // Update the selected status
    if (col.filterStatus !== 'all')
      col.filterValues?.forEach(x => { x.selected = true; });
    else
      col.filterValues?.forEach(x => { x.selected = false; });

    // Update the filter
    this.updateSelectFilter(col);
  }

  // Update selection of values in a given filter
  updateSelectFilter(col: DataTableColumn) {
    // Retrieve all selected values
    const selectedValues = col.filterValues?.filter(x => x.selected).map(x => x.value) || [];

    // Update the filter status
    col.filterStatus = selectedValues.length === col.filterValues?.length ?
      'all' :
      selectedValues.length === 0 ? 'none' : 'indeterminate';

    // Update the filter text
    col.filterText = selectedValues.length === col.filterValues?.length ?
      'All selected' :
      selectedValues.length === 0 ? 'None selected' : `${selectedValues.length} selected`;

    // Emit
    if (col.filterStatus === 'all')
      col.filterSubject$.next([this.FILTER_CACHE_ALL_SELECTED]);
    else
      col.filterSubject$.next(selectedValues);
  }

  // Reset the filter by applying optional default values
  resetFilter(defaultValues?: string[][]): void {
    // Emit filter default values
    this.columns.forEach((x, i) => {
      if (x.filterMode === 'select' || x.filterMode === 'numeric' || x.filterMode === 'icon') {
        if (defaultValues?.[i] && defaultValues[i].length && defaultValues[i][0] !== this.FILTER_CACHE_ALL_SELECTED)
          x.filterValues?.forEach(y => y.selected = defaultValues[i].includes(y.value));
        else // Reset the selected values
          x.filterValues?.forEach(y => y.selected = true);
        // Update the filter
        this.updateSelectFilter(x);
      }
      else if (x.filterMode === 'text') {
        // Update the filter
        this.processFilterValue(x, defaultValues?.[i]?.[0] || '');
      }
      else if (x.filterMode === 'none')
        x.filterSubject$.next([]);
    });
  }

  // Refresh the filter
  refreshFilter(): void {
    // Emit filter default values
    this.columns.forEach((x, i) => {
      if (x.filterMode === 'select' || x.filterMode === 'numeric') {
        // Update the filter
        this.updateSelectFilter(x);
      }
      else if (x.filterMode === 'text') {
        // Update the filter
        this.processFilterValue(x, x.filterText || '');
      }
    });
  }

  // ---------------------------------------------------
  // Export
  // ---------------------------------------------------
  // Export to Excel
  exportToExcel() {
    // Generate the list of columns for excel export
    // Only export columns of type 'text' when they are not explicit marked for exclusion
    // First add the columns from the grouping level and then the columns from the main table
    const columns = [
      ...this.settings.groupBy.reduce((acc, x) => { acc.push(...x.columns.filter(y => y.type === 'text' && y.name && !y.excludeFromExcelExport)); return acc; }, new Array()).map(x => ({ name: x.name, label: x.excelLabel || '!!Missing!!' })),
      ...this.settings.columnDefinitions.filter(x => x.type === 'text' && x.name && !x.excludeFromExcelExport).map(x => ({ name: x.name, label: x.excelLabel || x.label || '!!Missing!!' }))
    ];

    // Create the Excel header
    const headers = [columns.map(x => x.label)];

    // Create the Excel rows
    const rows = this.settings.data.reduce((acc, r) => {
      acc.push(columns.map(x => this.getPropertyByStringPath(r, x.name)))
      return acc;
    }, [] as string[][]);

    // Leave the table title undefined
    const title = undefined;

    // Leave the Excel tab name undefined, so that default "Sheet1" name is used
    const name = undefined;

    // Create the file name
    const fileName = 'Data table.xlsx';

    // TODO
    //this.excelService.generateExcel([{ name, title, headers, rows }], fileName);
  }

  // Export to Pdf
  // TODO Cedric
  exportToPdf() {
    alert('Pdf Export...TODO');
  }

  // Execute batch method
  batchMethod(control: DataTableToolbarControl): void {
    // Retrieve selected rows
    const selectedRows = this.rows.filter(x => x.selected);

    // Execute batch method
    control.callback(selectedRows);

    // Clear selection if required 
    if (!control.preserveSelection) {
      this.selectedCache = {};
      this.toggleSelectionAll(false);
    }
  }


  // ---------------------------------------------------
  // Drag and Drop
  // ---------------------------------------------------
  // Dropped event handler
  drop(event: CdkDragDrop<T[]>) {
    if (event.previousContainer === event.container) {
      // The table is using virtualization so we need to correct the index
      // Retrieve the virtualization index
      const viewPortStartIndex = this.virtualScroller.viewPortInfo.startIndex;

      // Offset the index to take into consideration virtualization
      event.previousIndex += viewPortStartIndex;
      event.currentIndex += viewPortStartIndex;

      // Retrieve the physical indexes
      const fromPhysical = this.filteredRows[event.previousIndex].physicalIndex;
      let toPhysical = this.filteredRows[event.currentIndex].physicalIndex;

      // Retrieve direction
      const forward = toPhysical > fromPhysical;

      // Adjust the index if the "to" row is collpased
      if (forward && !this.filteredRows[event.currentIndex].expanded && event.currentIndex < this.filteredRows.length - 1)
        toPhysical = this.filteredRows[event.currentIndex + 1].physicalIndex - 1;

      this.moveItemsInArray(this.rows, fromPhysical, toPhysical);
    } else {
      // TODO: do we need to drag in datatable from outside container
      console.log('dragged in from other container');
    }
  }

  // Ensure that the move is valid
  sortPredicate = (index: number, item: CdkDrag<DataTableRow<T>>, drop: any) => {
    // The table is using virtualization so we need to correct the index
    // Retrieve the virtualization index
    const viewPortStartIndex = this.virtualScroller.viewPortInfo.startIndex;

    // Offset the index to take into consideration virtualization
    index += viewPortStartIndex;

    const itemLevel = item.data.level;

    // Can drop anything at the end of the list
    if (index === drop.data.length - 1) return true;

    // Can drop only level 1 at the start of the list
    if (index === 0) return itemLevel === 1;

    // Adjust index based on drag direction
    const delta = item.data.physicalIndex > drop.data[index].physicalIndex ? 0 : 1;

    const dropAfterLevel = drop.data[index - 1 + delta].level;
    const dropBeforeLevel = drop.data[index + delta].level;

    // Otherwise, ensure that we are dropping in a parent of appropriate level
    return itemLevel === dropBeforeLevel ||                               // Drop just before a sibling
      (itemLevel <= dropAfterLevel && itemLevel >= dropBeforeLevel) ||    // Drop just after a child level AND just before a sibling/parent level
      (itemLevel === dropAfterLevel + 1);                                 // Drop in first place in a parent
  }

  // Move row with children and grandchildren together to the new position
  moveItemsInArray(array: any[], fromIndex: number, toIndex: number) {
    // Make sure from and to are within boundary of the array
    const from = Math.max(0, Math.min(array.length - 1, fromIndex));
    const to = Math.max(0, Math.min(array.length - 1, toIndex));

    // Exit if no change
    if (from === to) return;

    // Keep a copy of the moved items
    const movedItem = array[fromIndex];

    // Extract the rows to move
    const rowsToMove = [array[from]];
    let i = fromIndex + 1;
    const level = array[fromIndex].level;
    while (i < array.length && array[i].level > level) {
      rowsToMove.push(array[i]);
      i++;
    }

    // Initialize surrounding siblings
    let movedAfterSibling;
    let movedBeforeSibling;

    // Compute direction
    const forward = to > from;

    if (forward) {
      // Extract moveAfterSibling and moveBeforeSibling
      let idx = toIndex;
      while (idx >= 0 && array[idx].level > array[fromIndex].level) {
        idx--;
      }
      if (idx >= 0 && array[idx].level == array[fromIndex].level)
        movedAfterSibling = array[idx];


      idx = toIndex + 1
      while (idx < array.length && array[idx].level > array[fromIndex].level) {
        idx++;
      }
      if (idx < array.length && array[idx].level == array[fromIndex].level)
        movedBeforeSibling = array[idx];

      // Shift move
      let current = from;
      let stop = to - rowsToMove.length + 1;
      while (current < stop) {
        array[current] = array[current + rowsToMove.length];
        array[current].physicalIndex = current;
        current++;
      }
      // Paste
      let j = 0;
      while (current < to + 1) {
        array[current] = rowsToMove[j++];
        array[current].physicalIndex = current;
        current++;
      }
    } else {
      // Extract moveAfterSibling and moveBeforeSibling
      let idx = toIndex - 1;
      while (idx >= 0 && array[idx].level > array[fromIndex].level) {
        idx--;
      }
      if (idx >= 0 && array[idx].level == array[fromIndex].level)
        movedAfterSibling = array[idx];


      idx = toIndex
      while (idx < array.length && array[idx].level > array[fromIndex].level) {
        idx++;
      }
      if (idx < array.length && array[idx].level == array[fromIndex].level)
        movedBeforeSibling = array[idx];

      // Shift move
      let current = from;
      let stop = to;
      while (current > stop) {
        current--;
        array[current + rowsToMove.length] = array[current];
        array[current + rowsToMove.length].physicalIndex = current + rowsToMove.length;
      }
      // Paste
      let j = 0;
      while (current < to + rowsToMove.length) {
        array[current] = rowsToMove[j++];
        array[current].physicalIndex = current;
        current++;
      }
    }

    // Find the new parent row
    let index = to;
    let newParentData;
    // Parent row is always upper from the row
    while (index >= 0) {
      if (array[index].level === movedItem.level - 1) {
        newParentData = array[index];
        break;
      }
      index--;
    }
    this.itemMoved.emit({ data: movedItem, newParentData: newParentData, from: from, to: to, movedAfterSibling: movedAfterSibling, movedBeforeSibling: movedBeforeSibling });
    this.buildVisibleRows();
  }

  // ---------------------------------------------------
  // Helper
  // ---------------------------------------------------

  // Retrieve the value of a nested property
  getPropertyByStringPath(obj: any, path: string) {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, '');           // strip a leading dot
    var a = path.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (obj && k in obj) {
        obj = obj[k];
      } else {
        return;
      }
    }
    return obj;
  }
}
