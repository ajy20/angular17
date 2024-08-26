import { Component } from '@angular/core';
import { ThemeService } from '../../../../shared/theme/theme.service';
import { WorldMapContinent } from '../../../../shared/world-map/model/world-map-continent.model';
import { WorldMapCoordinate } from '../../../../shared/world-map/model/world-map-coordinate.model';
import { WorldMapComponent } from '../../../../shared/world-map/world-map.component';
 
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
  selector: 'csps-project-preview',
  standalone: true,
  imports: [WorldMapComponent],
  templateUrl: './project-preview.component.html',
  styleUrl: './project-preview.component.scss'
})
export class ProjectPreviewComponent {
  constructor(private themeService: ThemeService) { }

  project: Project = DEMOPROJECT;

  impactedFactories: WorldMapCoordinate[] = DEMOPROJECT.impactedFactories;

  impactedRegions: Map<WorldMapContinent, { color: string }> = DEMOPROJECT.impactedContinents.reduce((acc, c) => {
    acc.set(c, { color: this.themeService.colors.primary })
    return acc;
  }, new Map<WorldMapContinent, { color: string }>())

}
