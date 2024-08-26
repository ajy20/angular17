import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { faBroom } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { Anomaly } from './model/anomaly.model';
import { DataTableComponent } from '../../../../../shared/data-table/data-table.component';
import { DataTableSettings } from '../../../../../shared/data-table/model/data-table-settings.model';
import { DataTableColumnDefinition } from '../../../../../shared/data-table/model/data-table-column-definition.model';
import { DataTableToolbarControl } from '../../../../../shared/data-table/model/data-table-toolbar-control.model';

@Component({
  selector: 'csps-anomalies',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './anomalies.component.html',
  styleUrls: ['./anomalies.component.scss']
})
export class AnomaliesComponent implements OnInit, OnDestroy {
  @Input() config!: {
    anomalies: Anomaly[],
    admin: boolean,
  }

  @Output()
  submitted: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  dismissed: EventEmitter<any> = new EventEmitter<any>();

  // The datatable settings
  settings!: DataTableSettings<any>;

  // Used for cleaning subscription 
  private unsubscribe: Subject<void> = new Subject();

  constructor() { }

  ngOnInit(): void {
    this.buildTableSettings();
  }

  ngOnChanges(): void {
    this.buildTableSettings();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  buildTableSettings(): void {
    const columnDefinition: DataTableColumnDefinition[] = [
      { id: '1', name: 'anomalyNumber', label: '#', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
      { id: '2', name: 'anomaly', label: 'Anomaly', type: 'text', visible: true, searchable: false, filterMode: 'none' },];

    this.settings = {
      selectableRows: false,
      columnDefinitions: columnDefinition,
      data: this.config.anomalies.map((x, i) => ({
        anomalyNumber: i + 1,
        anomaly: x.description,
      })) || [],
      toolBar: {
        right: [
          ...this.config.admin ? [{ name: 'Clean Anomalies', icon: faBroom, type: 'button', callback: () => this.cleanAnomalies() } as DataTableToolbarControl] : []
        ]
      },
      groupBy: []
    };
  }

  // Clean anomalies
  cleanAnomalies() {
    this.submitted.emit({ type: 'clean' });
  }

  dismissForm(method: string) {
    this.dismissed.emit(method);
  }
}