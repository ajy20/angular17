import { Component, OnInit } from '@angular/core';
import { BacklogTableComponent } from '../../../../shared/backlog-table/backlog-table.component';
import { BacklogTableWorkItem } from '../../../../shared/backlog-table/model/backlog-table-work-item.model';
import { DynamicFormService } from '../../../../shared/dynamic-form/services/dynamic-form.service';
import { PageTemplateComponent } from '../../../../shared/page-template/page-template.component';

@Component({
  selector: 'csps-backlog',
  standalone: true,
  imports: [PageTemplateComponent, BacklogTableComponent],
  templateUrl: './backlog.component.html',
  styleUrl: './backlog.component.scss'
})
export class BacklogComponent implements OnInit {

  constructor(private dynamicFormService: DynamicFormService) { }

  ngOnInit(): void {
  }


  workItems: BacklogTableWorkItem[] = [
    { id: '1', name: 'Task 1', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '1', name: 'ECN24-0002 - Update drawings' } },
    { id: '2', name: 'Task 2', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '2', name: 'Unit assembly' }, story: { id: '3', name: '12 Fan' } },
    { id: '3', name: 'Task 3', productLine: { id: '2', name: 'Sales Orders' }, epic: { id: '3', name: 'PDX Tcore CYK' }, feature: { id: '4', name: 'PV Vessels' }, story: { id: '8', name: 'Evaporator' } },
    { id: '4', name: 'Task 4', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '2', name: 'ECN24-0001E - EOM Structure' } },
    { id: '5', name: 'Task 5', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '2', name: 'Unit assembly' }, story: { id: '4', name: '14 Fan' } },
    { id: '6', name: 'Task 6', productLine: { id: '2', name: 'Sales Orders' }, epic: { id: '3', name: 'PDX Tcore CYK' }, feature: { id: '4', name: 'PV Vessels' }, story: { id: '9', name: 'Condenser' } },
    { id: '7', name: 'Task 7', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '3', name: 'System piping' }, story: { id: '5', name: '0041 System Piping' } },
    { id: '8', name: 'Task 8', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '3', name: 'System piping' }, story: { id: '6', name: '0048 System Piping' } },
    { id: '9', name: 'Task 9', productLine: { id: '2', name: 'Sales Orders' }, epic: { id: '4', name: 'University of Texas CYK' }, feature: { id: '6', name: 'System' }, story: { id: '10', name: 'System Layout' } },
    { id: '10', name: 'Task 10', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '3', name: 'Compressor Subs' }, story: { id: '7', name: 'Phase 1' } },
    { id: '11', name: 'Task 11', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '1', name: 'ECN24-0002 - Update drawings' } },
    { id: '12', name: 'Task 12', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '1', name: 'ECN24-0002 - Update drawings' } },

  ]


  test(): void {
    this.dynamicFormService.popNotification({
      headerText: 'Notification',
      submitText: 'OK',
      closeText: 'Cancel',
      notifications: ['success 1', 'success 2'],
      onSubmit: () => { alert('submitted') },
      onDismiss: () => { alert('dismissed') }
    });
  }

  test2(): void {
    this.dynamicFormService.popDynamicFormModal({
      headerText: 'Dynamic Form',
      submitText: 'OK',
      closeText: 'No',
      fields: [
        { name: 'test', type: 'input', label: 'Test', value: 'testABC'  }
      ],
      onSubmit: (e: { test: string }) => { debugger;  alert('submitted ' + e.test) },
      onDismiss: () => { alert('dismissed') }
    })
  }

  //favouriteProductToggled: action('favouriteProductToggled'),
  //workItemNavigated: action('workItemNavigated'),
}
