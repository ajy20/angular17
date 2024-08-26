import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { DataTableComponent } from '../../../../shared/data-table/data-table.component';
import { DataTableSettings } from '../../../../shared/data-table/model/data-table-settings.model';
import { PageWrapperComponent } from '../../../../shared/page-wrapper/page-wrapper.component';
import { MenuItem } from '../../../../shared/side-bar/model/menu-item.model';
import { ChangeRequest } from '../shared/models/change-request.model';
import { PLMService } from '../shared/plm.service';

@Component({
  selector: 'csps-change-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PageWrapperComponent, DataTableComponent],
  templateUrl: './change-request-list.component.html',
  styleUrl: './change-request-list.component.scss'
})
export class ChangeRequestListComponent implements OnInit {
  menuItems: MenuItem[] = [
    { id: '1', label: 'Test' }
  ];


  settings!: DataTableSettings<ChangeRequest>;

  // Used for cleaning subscription 
  private unsubscribe: Subject<void> = new Subject();

  constructor(private plmService: PLMService) { }

  ngOnInit(): void {

    this.plmService.changeRequests$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(x => {
        this.settings = {
          data: x.map(y => ({ ...y, link: faExternalLinkAlt, open: faInfoCircle })),
          columnDefinitions: [
            { id: '1', label: 'Number', name: 'Number', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '2', label: 'Name ', name: 'Name', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '3', label: 'Context', name: 'Context.Name', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '4', label: 'State', name: 'State.Value', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '5', label: 'Created On', name: 'CreatedOn', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '6', label: 'Open', name: 'open', type: 'icon', visible: true, searchable: false, filterMode: 'none', click: this.openChangeRequest.bind(this) },
            { id: '7', label: 'Link', name: 'link', type: 'icon', visible: true, searchable: false, filterMode: 'none', click: this.plmService.openChangeRequestInPLM.bind(this) },
           ],
          groupBy: []
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  openChangeRequest(changeRequest: ChangeRequest): void {
    alert(JSON.stringify(changeRequest));
  }

}
