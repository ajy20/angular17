import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubMenuItem } from '../../../../shared/page-template/model/sub-menu-item.model';
import { PageTemplateComponent } from '../../../../shared/page-template/page-template.component';

@Component({
  selector: 'csps-settings',
  standalone: true,
  imports: [PageTemplateComponent, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  subMenu: SubMenuItem[] = [
    { name: 'Overview', route: ['./overview'] },
    { name: 'Documents', route: ['./documents'] },
    { name: 'Roles', route: ['./roles'] },
    { name: 'Tickets', route: ['./tickets'] },
    { name: 'Manufacturing', route: ['./manufacturing'] },
  ];
}
