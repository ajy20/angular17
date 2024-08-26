import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { faBookOpen, faClipboardCheck, faCrown, faExternalLink, faEyeSlash, faStar, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { faEye, faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';
import { DataTableComponent } from '../data-table/data-table.component';
import { DataTableSettings } from '../data-table/model/data-table-settings.model';
import { BacklogTableOptions } from './model/backlog-table-options.model';
import { BacklogTableWorkItem } from './model/backlog-table-work-item.model';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'csps-backlog-table',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './backlog-table.component.html',
  styleUrl: './backlog-table.component.scss'
})
export class BacklogTableComponent implements OnChanges, OnDestroy {
  // The list of workitems
  @Input() workItems!: BacklogTableWorkItem[];

  // The backlog table options
  @Input() options?: BacklogTableOptions;

  // The event emitted when a favourite product is toggled
  @Output() favouriteProductToggled: EventEmitter<string> = new EventEmitter<string>();

  // The event emitted when a work item is navigated to
  @Output() workItemNavigated: EventEmitter<string> = new EventEmitter<string>();

  // The visibility status for the tasks
  tasksVisible$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  // The datatable settings
  settings!: DataTableSettings<BacklogTableWorkItem>

  // Used for cleaning subscriptions
  private unsubscribe: Subject<void> = new Subject();

  constructor() { }

  ngOnChanges(): void {
    // TODO
    const taskVisible = true;

    // Enrich list of work items
    const data = this.workItems.map((x, i) => {
      const favProductLine = !!this.options?.favouriteProductLineIds.includes(x.productLine.id);

      return {
        ...x,
        productLine: { ...x.productLine, favorite: favProductLine, icon: favProductLine ? faStar : faStarEmpty },
        epic: { ...x.epic, icon: faCrown },
        feature: { ...x.feature, icon: faTrophy, priority: 'H' + (i + 1) },
        story: { ...x.story, team: ['Team A', 'Team B'][i % 2], readiness: ['𐩒', '◔', '◐', '◕', '⏺'][i % 5], icon: faBookOpen, committed: ['None', '28.1', '28.2', '28.3'][i % 4], createdOn: '2024-07-02', dueBy:'9999-12-31', effort: ['1', '2', '3', '5', '8', '13', '21'][i % 7] },
        icon: faClipboardCheck,
        navigateIcon: faExternalLink
      };
    });

    this.settings = {
      data: data,
      hideRow: (row: any) => row.isPlaceholder || (row.level === 5 && !taskVisible),
      columnDefinitions: [
        { id: '5', label: 'Priority', name: 'priority', type: 'text', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: true, filterMode: 'select' },
        { id: '0', label: '', name: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '1', label: '', name: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: '', name: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: '', name: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: '', name: 'icon', type: 'icon', cellClass: 'yellow-text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '5', label: 'Name', name: 'name', type: 'text', cellAlignment: 'left', visible: true, searchable: true, filterMode: 'text' },
        { id: '5', label: 'Committed', name: 'committed', type: 'text', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: true, filterMode: 'select' },
        { id: '5', label: 'Effort Consensus', name: 'effort', type: 'text', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: true, filterMode: 'select' },
        { id: '6', label: 'Created On', name: 'createdOn', type: 'text', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: true, filterMode: 'text' },
        { id: '7', label: 'Due By', name: 'dueBy', type: 'text', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: true, filterMode: 'text' },
        { id: '8', label: 'Team', name: 'team', type: 'text', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: true, filterMode: 'select' },
        { id: '9', label: 'Readiness', name: 'readiness', type: 'text', cellAlignment: 'center', columnClass: 'fit', cellClass: 'py-0 symbol-font red-text', visible: true, searchable: false, filterMode: 'none' },
        { id: '10', label: 'Link', name: 'navigateIcon', type: 'icon', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none', click: this.navigate.bind(this) }
      ],
      toolBar: {
        right: [
          { name: 'Search', type: 'search', callback: () => { } },
          { name: taskVisible ? 'Hide Tasks' : 'Show Tasks', type: 'button', icon: taskVisible ? faEyeSlash : faEye, callback: this.toggleTaskVisibility.bind(this) },
          { name: 'Export to Excel', type: 'excel', callback: () => { } }
        ]
      },
      groupBy: [
        {
          property: 'productLine.id', orderBy: ['productLine.name'], columns: [
            { name: '', type: 'text', alignment: 'left', colspan: 1 },
            { name: 'productLine.icon', type: 'icon', alignment: 'left', class: 'fit yellow-text', colspan: 1, click: this.toggleFavoriteProductLine.bind(this) },
            { name: 'productLine.name', type: 'text', alignment: 'left', class: 'red-text fw-bold text-uppercase', colspan: 11 },
            { name: 'navigateIcon', type: 'icon', alignment: 'center', colspan: 1, click: this.navigate.bind(this) }
          ]
        },
        {
          property: 'epic.id', orderBy: ['epic.name'], columns: [
            { name: '', type: 'text', alignment: 'left', colspan: 2},
            { name: 'epic.icon', type: 'icon', alignment: 'left', class: 'fit orange-text', colspan: 1 },
            { name: 'epic.name', type: 'text', alignment: 'left', class: 'fw-bold', colspan: 10 },
            { name: 'navigateIcon', type: 'icon', alignment: 'center', colspan: 1, click: this.navigate.bind(this) }
          ]
        },
        {
          property: 'feature.id', orderBy: ['feature.name'], columns: [
            { name: 'feature.priority', type: 'text', alignment: 'center', class: '', colspan: 1 },
            { name: '', type: 'text', alignment: 'left', colspan: 2 },
            { name: 'feature.icon', type: 'icon', alignment: 'left', class: 'fit purple-text', colspan: 1 },
            { name: 'feature.name', type: 'text', alignment: 'left', class: '', colspan: 3 },
            { name: '', type: 'text', alignment: 'center', class: '', colspan: 6 },
            { name: 'navigateIcon', type: 'icon', alignment: 'center', colspan: 1, click: this.navigate.bind(this) }
          ]
        },
        {
          property: 'story.id', orderBy: ['story.name'], columns: [
            { name: '', type: 'text', alignment: 'left', colspan: 4 },
            { name: 'story.icon', type: 'icon', alignment: 'left', class: 'fit cyan-text', colspan: 1 },
            { name: 'story.name', type: 'text', alignment: 'left', class: '', colspan: 2 },
            { name: 'story.committed', type: 'text', alignment: 'center', class: '', colspan: 1 },
            { name: 'story.effort', type: 'text', alignment: 'center', class: '', colspan: 1 },
            { name: 'story.createdOn', type: 'text', alignment: 'center', class: '', colspan: 1 },
            { name: 'story.dueBy', type: 'text', alignment: 'center', class: '', colspan: 1 },
            { name: 'story.team', type: 'text', alignment: 'center', class: '', colspan: 1 },
            { name: 'story.readiness', type: 'text', alignment: 'center', class: 'py-0 symbol-font red-text', colspan: 1, click: this.displayStatusDetails.bind(this) },
            { name: 'navigateIcon', type: 'icon', alignment: 'center', colspan: 1, click: this.navigate.bind(this) }
          ]
        },
      ]
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  toggleFavoriteProductLine(rowData: { productLine: { id: string } }): void {
    this.favouriteProductToggled.emit(rowData.productLine.id);
  }

  navigate(rowData: { rowId: string }): void {
    this.workItemNavigated.emit(rowData.rowId);
  }

  toggleTaskVisibility() {
    this.tasksVisible$.next(!this.tasksVisible$.getValue());
  }

  displayStatusDetails(rowData: { rowId: string }): void {
    alert(rowData.rowId);
  }
}


