import { Component } from '@angular/core';
import { PageTemplateComponent } from '../../../shared/page-template/page-template.component';

@Component({
  selector: 'csps-products',
  standalone: true,
  imports: [PageTemplateComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

}
