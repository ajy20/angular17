import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { DoubleClickDirective } from '../double-click/double-click.directive';
import { Epic } from './model/epic.model';
import { Feature } from './model/feature.model';
import { ProgramIncrement } from './model/program-increment.model';

@Component({
  selector: 'csps-feature-map',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, DragDropModule, DoubleClickDirective],
  templateUrl: './feature-map.component.html',
  styleUrl: './feature-map.component.scss'
})
export class FeatureMapComponent implements OnChanges {
  // Icons
  faEdit: IconDefinition = faEdit;

  @Input() epics: Epic[] = [];
  @Input() programIncrements: ProgramIncrement[] = [];

  @Output() featureOpenRequested = new EventEmitter<Feature>();
  @Output() epicMoved = new EventEmitter<Feature>();
  @Output() featureMoved = new EventEmitter<Feature>();


  actualProgramIncrements: ProgramIncrement[] = [];

  featuresByEpicAndProgramIncrement = [];


 

  ngOnChanges(): void {
    // Create an "unplanned" program increment to display yet-to-be-scheduled features
    this.actualProgramIncrements = [{ id: '0', name: 'Unplanned' }, ...this.programIncrements];

    this.distributeFeaturestoEpicsAndProgramIncrements();
  }

  distributeFeaturestoEpicsAndProgramIncrements(): void {
    // Generate the list of features per epic and program increment
    this.featuresByEpicAndProgramIncrement = this.epics.reduce((acc, e) => {
      // Create all program increment "containers"
      acc[e.id] = this.actualProgramIncrements.reduce((acc2, p) => {
        acc2[p.id] = [];
        return acc2;
      }, {} as any);

      // Distribute features to program increment "containers"
      e.features.forEach(f => {
        const id = f.targetProgramIncrementId || '0';
        acc[e.id][id].push(f);
      });

      return acc;
    }, {} as any)
  }


  addFeatureToEpicAndProgramIncrement(epicId: string, programIncrementId: string): void {
    // Locate epic
    const epic = this.epics.find(x => x.id == epicId);
    epic?.features.push({ id: '0', name: 'New feature', targetProgramIncrementId: programIncrementId });

    this.distributeFeaturestoEpicsAndProgramIncrements();
  }


  editEpic(epic: Epic): void {
    alert('Edit Epic: ' + epic.name);
  }


  openFeature(feature: Feature): void {
    this.featureOpenRequested.emit(feature);
  }

  getConnectedList(): any[] {
    return this.epics.reduce((acc, e) => {
      acc.push(...this.actualProgramIncrements.map(p => `${e.id}${p.id}`));
      return acc;
    }, new Array());
  }

  drop(event: CdkDragDrop<string[]>) {
    // TODO: Emit on feature or epic moved 

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
