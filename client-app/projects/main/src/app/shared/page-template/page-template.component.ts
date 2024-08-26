import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubMenuItem } from './model/sub-menu-item.model';

@Component({
  selector: 'csps-page-template',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-template.component.html',
  styleUrl: './page-template.component.scss'
})
export class PageTemplateComponent {
  @Input() subMenu?: SubMenuItem[];
}
