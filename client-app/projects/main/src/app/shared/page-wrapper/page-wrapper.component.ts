import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuItem } from '../side-bar/model/menu-item.model';
import { QuickLink } from '../side-bar/model/quick-link.model';
import { SideBarComponent } from '../side-bar/side-bar.component';

@Component({
  selector: 'csps-page-wrapper',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NgbCollapseModule, SideBarComponent],
  templateUrl: './page-wrapper.component.html',
  styleUrl: './page-wrapper.component.scss'
})
export class PageWrapperComponent {
  // Icons
  faBars: IconDefinition = faBars;

  // Indicates if the menu is collapsed
  isMenuCollapsed: boolean = false;

  @Input() menuItems!: MenuItem[];
  @Input() quickLinks!: QuickLink[];
  @Input() menuHeader!: string;
}
