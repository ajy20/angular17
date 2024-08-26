import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { DataTableComponent } from '../../../../shared/data-table/data-table.component';
import { DataTableSettings } from '../../../../shared/data-table/model/data-table-settings.model';
import { PageTemplateComponent } from '../../../../shared/page-template/page-template.component';
import { PageWrapperComponent } from '../../../../shared/page-wrapper/page-wrapper.component';
import { MenuItem } from '../../../../shared/side-bar/model/menu-item.model';
import { Project } from '../../shared/project.model';
 
const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'YKJ',
    prop1: 'fdsf',
    prop2: 'ezeaze'
  },
  {
    id: '2',
    name: 'YE',
    prop1: 'fdsf',
    prop2: 'ezeaze'
  },
  {
    id: '3',
    name: 'YMC2 M7',
    prop1: 'fdsf',
    prop2: 'ezeaze'
  },
  {
    id: '4',
    name: 'TBA',
    prop1: 'fdsf',
    prop2: 'ezeaze'
  },
];


@Component({
  selector: 'csps-project-list',
  standalone: true,
  imports: [PageWrapperComponent, PageTemplateComponent, CommonModule, DataTableComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent {
  constructor(private router: Router, private route: ActivatedRoute) { }

  dataSource = PROJECTS;

  settings: DataTableSettings<Project> = {
    data: PROJECTS.map(p => ({ ...p, icon: faExternalLink })),
    columnDefinitions: [
      { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'numeric' },
      { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'text' },
      { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'select' },
      { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'text' },
      { id: '5', label: 'Link', name: 'icon', type: 'icon', visible: true, searchable: false, filterMode: 'none', click: this.navigate.bind(this) },
    ],
    groupBy: []
  }


  navigate(project: Project): void {
    this.router.navigate(['..', 'projects', project.id], { relativeTo: this.route });
  }

  menuItems: MenuItem[] = [
    { id: '1', label: 'test' }
  ];
}
