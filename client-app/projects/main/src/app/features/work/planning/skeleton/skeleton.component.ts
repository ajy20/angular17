import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageWrapperComponent } from '../../../../shared/page-wrapper/page-wrapper.component';
import { MenuItem } from '../../../../shared/side-bar/model/menu-item.model';
import { QuickLink } from '../../../../shared/side-bar/model/quick-link.model';
import { PlanningMenuService } from '../shared/planning-menu.service';

@Component({
  selector: 'csps-skeleton',
  standalone: true,
  imports: [PageWrapperComponent, RouterModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent implements OnInit {
  // The menu items, quickLinks
  menuItems!: MenuItem[];
  quickLinks!: QuickLink[];

  constructor(private planningMenuService: PlanningMenuService) { }

  ngOnInit(): void {
    this.menuItems = this.planningMenuService.menuItems;
    this.quickLinks = this.planningMenuService.quickLinks;
  }
}
