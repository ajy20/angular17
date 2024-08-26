import { Component, OnInit } from '@angular/core';
import { faDollar, faFilter } from '@fortawesome/free-solid-svg-icons';
import { DataTableComponent } from '../../../../shared/data-table/data-table.component';
import { DataTableColumnDefinition } from '../../../../shared/data-table/model/data-table-column-definition.model';
import { DataTableSettings } from '../../../../shared/data-table/model/data-table-settings.model';
 


export interface Budget {
  department: string;
  region: string;
  professionalServices: number;
  developmentMaterial: number;
  testHours: number;
  engineeringHours: number;
  designHours: number;
}


@Component({
  selector: 'csps-project-budget',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './project-budget.component.html',
  styleUrl: './project-budget.component.scss'
})
export class ProjectBudgetComponent implements OnInit {

  d: Budget[] = [
    { department: 'depart1', region: 'Europe', professionalServices: 24500, developmentMaterial: 41526, testHours: 250, engineeringHours: 30, designHours: 95 },
    { department: 'depart1', region: 'Asia', professionalServices: 5265, developmentMaterial: 321, testHours: 0, engineeringHours: 12, designHours: 5 },
    { department: 'depart2', region: 'North America', professionalServices: 454, developmentMaterial: 321, testHours: 0, engineeringHours: 30, designHours: 7 },
    { department: 'depart2', region: 'Europe', professionalServices: 7853, developmentMaterial: 12, testHours: 25, engineeringHours: 8, designHours: 7 },
  ]


  settings!: DataTableSettings<Budget>;


  ngOnInit(): void {
    this.updateTable('department');
  }

  updateGroupBy(groupBy: string): () => void {
    return () => {
      this.updateTable(groupBy);
    }
  }

  updateTable(groupBy: string): void {
    this.settings = {
      columnDefinitions: [
        ...groupBy === 'department' ? [] : [{ id: '1', name: 'department', label: 'Department', type: 'text', visible: true, searchable: false, filterMode: 'none' } as DataTableColumnDefinition] ,
        ...groupBy === 'region' ? [] : [{ id: '2', name: 'region', label: 'Region', type: 'text', visible: true, searchable: false, filterMode: 'none' } as DataTableColumnDefinition],
        { id: '3', name: 'professionalServices', label: 'Prof. Srv.', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', name: 'developmentMaterial', label: 'Dev. Mat.', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '5', name: 'testHours', label: 'Test Hours', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '6', name: 'engineeringHours', label: 'Eng. Hours', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '7', name: 'designHours', label: 'Des. Hours', type: 'text', visible: true, searchable: false, filterMode: 'none' },
      ],
      data: this.d,
      toolBar: {
        right: [
          { name: 'My Budget', icon: faDollar, type: 'button', callback: () => alert('Show my budget') },
          {
            name: 'Group By', icon: faFilter, type: 'dropdown', callback: () => { }, controls: [
              { name: 'Department', type: 'button', callback: this.updateGroupBy('department').bind(this) },
              { name: 'Region', type: 'button', callback: this.updateGroupBy('region').bind(this) }
            ]
          },
        ]
      },
      groupBy: [
        {
          property: groupBy, orderBy: [groupBy], columns: [
            { name: groupBy, type: 'text', alignment: 'left', class: 'fw-bold', searchable: false, colspan: 7 },
          ]
        }
      ]
    }
  }
}
