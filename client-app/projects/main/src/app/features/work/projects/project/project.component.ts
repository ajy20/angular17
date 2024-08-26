import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SubMenuItem } from '../../../../shared/page-template/model/sub-menu-item.model';
import { PageTemplateComponent } from '../../../../shared/page-template/page-template.component';
import { PageWrapperComponent } from '../../../../shared/page-wrapper/page-wrapper.component';
import { WorldMapContinent } from '../../../../shared/world-map/model/world-map-continent.model';
import { WorldMapCoordinate } from '../../../../shared/world-map/model/world-map-coordinate.model';


export interface Project {
  name: string;
  impactedContinents: WorldMapContinent[],
  impactedFactories: WorldMapCoordinate[]
}

const DEMOPROJECT: Project = {
  name: 'YLAA (Style A & B) & YLUA (Style B) 60 Hz R-454B',
  impactedContinents: ['Europe', 'Asia', 'North America'],
  impactedFactories: [
    { id: '1', city: 'Paris', lat: 48.864716, long: 2.349014, color: '#ff0000', click: () => { } },
    { id: '2', city: 'New York', lat: 40.73061, long: -73.935242, color: '#ff0000', click: () => { } },
    { id: '3', city: 'Test', lat: 50.73061, long: -73.935242, color: '#ff0000', click: () => { } }
  ]
};


@Component({
  selector: 'csps-project',
  standalone: true,
  imports: [CommonModule, RouterModule, PageWrapperComponent, PageTemplateComponent, CdkDropListGroup, CdkDropList, CdkDrag, TranslateModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent {
  constructor() { }

  project: Project = DEMOPROJECT;

  subMenu: SubMenuItem[] = [
    { name: 'Preview', route: ['./preview'] },
    { name: 'Budget', route: ['./budget'] },
    { name: 'Forecast', route: ['./forecast'] },
    { name: 'Schedule', route: ['./schedule'] },
    { name: 'Design', route: ['./design'] },
    { name: 'Etc...', route: ['./etc'] }
  ];

  pop(item: any) {
    alert('pop' + item.id);
  }

  childNodeActionClicked(data: any) {
    console.log(data);
  }
  parentNodeActionClicked(data: any) {
    console.log(data);
  }
}
