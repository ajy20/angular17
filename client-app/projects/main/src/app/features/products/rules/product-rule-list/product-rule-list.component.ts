import { Component } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PageTemplateComponent } from '../../../../shared/page-template/page-template.component';

@Component({
  selector: 'csps-product-rule-list',
  standalone: true,
  imports: [PageTemplateComponent, NgbTooltipModule],
  templateUrl: './product-rule-list.component.html',
  styleUrl: './product-rule-list.component.scss'
})
export class ProductRuleListComponent {

}
