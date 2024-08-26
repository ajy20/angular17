import { Component, OnInit } from '@angular/core';
import { PageTemplateComponent } from '../../../../shared/page-template/page-template.component';

@Component({
  selector: 'csps-priorities',
  standalone: true,
  imports: [PageTemplateComponent],
  templateUrl: './priorities.component.html',
  styleUrl: './priorities.component.scss'
})
export class PrioritiesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
