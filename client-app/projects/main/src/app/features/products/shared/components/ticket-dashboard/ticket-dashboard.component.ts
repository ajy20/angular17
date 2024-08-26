import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { DataTableComponent } from '../../../../../shared/data-table/data-table.component';
import { DataTableSettings } from '../../../../../shared/data-table/model/data-table-settings.model';
import { TicketDashboardOptions } from './model/ticket-dashboard-options.model';
import { TicketDashboardTicket } from './model/ticket-dashboard-ticket.model';

@Component({
  selector: 'csps-ticket-dashboard',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './ticket-dashboard.component.html',
  styleUrl: './ticket-dashboard.component.scss'
})
export class TicketDashboardComponent implements OnChanges, OnDestroy {
  // The list of tickets
  @Input() tickets!: TicketDashboardTicket[];

  // The ticket dashboard options
  @Input() options?: TicketDashboardOptions;

  // The event emitted when a ticket is navigated to
  @Output() ticketNavigated: EventEmitter<string> = new EventEmitter<string>();

  // The event emitted when a product is navigated to
  @Output() productNavigated: EventEmitter<string> = new EventEmitter<string>();

  // The event emitted when a document is navigated to
  @Output() documentOpened: EventEmitter<string> = new EventEmitter<string>();

  // The event emitted when a ticket is navigated to
  @Output() ticketAdded: EventEmitter<string> = new EventEmitter<string>();

  // TODO: Add other event emitters as needed

  // The datatable settings
  settings!: DataTableSettings<TicketDashboardTicket>

  // Used for cleaning subscriptions
  private unsubscribe: Subject<void> = new Subject();

  constructor() { }

  ngOnChanges(): void {
    // Enrich list of tickets as necessary
    const data = this.tickets.map((x, i) => {
      return {
        ...x,
        navigateIcon: faExternalLink
      };
    });

    this.settings = {
      data: data,
      hideRow: (row: any) => row.isPlaceholder,
      columnDefinitions: [
        { id: '1', label: '', name: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name', name: 'name', type: 'text', cellAlignment: 'left', visible: true, searchable: true, filterMode: 'text' },
        { id: '9', label: 'Link', name: 'navigateIcon', type: 'icon', cellAlignment: 'center', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none', click: this.navigateToTicket.bind(this) }
      ],
      toolBar: {
        right: [
          { name: 'Search', type: 'search', callback: () => { } },
          { name: 'Export to Excel', type: 'excel', callback: () => { } }
        ]
      },
      groupBy: [
        {
          property: 'productLine.id', orderBy: ['productLine.name'], columns: [
             { name: 'productLine.name', type: 'text', alignment: 'left', class: 'fw-bold text-uppercase', colspan:2 },
            { name: 'navigateIcon', type: 'icon', alignment: 'center', colspan: 1, click: this.navigateToProduct.bind(this) }
          ]
        }
      ]
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  navigateToTicket(rowData: { rowId: string }): void {
    this.ticketNavigated.emit(rowData.rowId);
  }

  navigateToProduct(rowData: { rowId: string }): void {
    this.productNavigated.emit(rowData.rowId);
  }
}
