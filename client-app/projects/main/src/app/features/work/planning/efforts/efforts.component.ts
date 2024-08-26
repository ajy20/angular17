import { Component, OnInit } from '@angular/core';
import { PageTemplateComponent } from '../../../../shared/page-template/page-template.component';

@Component({
  selector: 'csps-efforts',
  standalone: true,
  imports: [PageTemplateComponent],
  templateUrl: './efforts.component.html',
  styleUrl: './efforts.component.scss'
})
export class EffortsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
