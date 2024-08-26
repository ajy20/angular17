import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { DataTableComponent } from '../../../../shared/data-table/data-table.component';
import { DataTableSettings } from '../../../../shared/data-table/model/data-table-settings.model';
import { PageWrapperComponent } from '../../../../shared/page-wrapper/page-wrapper.component';
import { MenuItem } from '../../../../shared/side-bar/model/menu-item.model';
import { ChangeRequest } from '../shared/models/change-request.model';
import { WorkItem } from '../shared/models/work-item.model';
import { PLMService } from '../shared/plm.service';

@Component({
  selector: 'csps-work-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PageWrapperComponent, DataTableComponent],
  templateUrl: './work-item-list.component.html',
  styleUrl: './work-item-list.component.scss'
})
export class WorkItemListComponent {
  menuItems: MenuItem[] = [
    { id: '1', label: 'Test' }
  ];

  settings!: DataTableSettings<WorkItem>;

  // Used for cleaning subscription 
  private unsubscribe: Subject<void> = new Subject();

  constructor(private plmService: PLMService) { }

  ngOnInit(): void {

    this.plmService.workItems$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(x => {
        this.settings = {
          data: x.map(y => ({ ...y, link: faExternalLinkAlt })).sort((a, b) => a.Subject.SubjectName > b.Subject.SubjectName ? 1 : -1),
          columnDefinitions: [
            { id: '1', label: 'ID', name: 'ID', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '2', label: 'Description ', name: 'Description', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '3', label: 'Subject', name: 'Subject.SubjectName', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '4', label: 'Status', name: 'Status.Value', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '5', label: 'Created On', name: 'CreatedOn', type: 'text', visible: true, searchable: false, filterMode: 'text' },
            { id: '6', label: 'Link', name: 'link', type: 'icon', visible: true, searchable: false, filterMode: 'none', click: this.plmService.openChangeRequestInPLM.bind(this) },
          ],
          groupBy: [
            {
              property: 'Subject.SubjectName', orderBy: ['Subject.SubjectName'], columns: [
                { name: 'Subject.SubjectName', type: 'text', alignment: 'left', colspan: 5 }
              ]
            }

          ]
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
