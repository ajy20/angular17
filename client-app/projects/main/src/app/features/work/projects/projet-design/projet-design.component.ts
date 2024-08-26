import { Component } from '@angular/core';
import { BurnDownChartComponent } from '../../../../shared/burn-down-chart/burn-down-chart.component';
import { BurnDownChartOptions } from '../../../../shared/burn-down-chart/model/burn-down-chart-options.model';
import { BurnDownChartTask } from '../../../../shared/burn-down-chart/model/burn-down-chart-task.model';
 
@Component({
  selector: 'csps-projet-design',
  standalone: true,
  imports: [BurnDownChartComponent],
  templateUrl: './projet-design.component.html',
  styleUrl: './projet-design.component.scss'
})
export class ProjetDesignComponent {
  tasks: BurnDownChartTask[] = [
    { id: '1', name: 'Task 1', effort: 8, plannedCompletionDate: new Date(new Date('2024-02-09').toDateString()), actualCompletionDate: new Date(new Date('2024-02-09').toDateString()) },
    { id: '2', name: 'Task 2', effort: 5, plannedCompletionDate: new Date(new Date('2024-02-05').toDateString()), actualCompletionDate: new Date(new Date('2024-02-07').toDateString()) },
    { id: '3', name: 'Task 3', effort: 3, plannedCompletionDate: new Date(new Date('2024-02-06').toDateString()), actualCompletionDate: new Date(new Date('2024-02-05').toDateString()) },
    { id: '4', name: 'Task 4', effort: 13, plannedCompletionDate: new Date(new Date('2024-02-08').toDateString()), actualCompletionDate: new Date(new Date('2024-02-09').toDateString()) },
    { id: '5', name: 'Task 5', effort: 21, plannedCompletionDate: new Date(new Date('2024-02-07').toDateString()), actualCompletionDate: new Date(new Date('2024-02-09').toDateString()) },
    { id: '6', name: 'Task 6', effort: 13, plannedCompletionDate: new Date(new Date('2024-02-12').toDateString()), actualCompletionDate: new Date(new Date('2024-02-14').toDateString()) },
    { id: '7', name: 'Task 7', effort: 8, plannedCompletionDate: new Date(new Date('2024-02-16').toDateString()), actualCompletionDate: null },
    { id: '8', name: 'Task 8', effort: 5, plannedCompletionDate: new Date(new Date('2024-02-15').toDateString()), actualCompletionDate: null },
    { id: '9', name: 'Task 9', effort: 2, plannedCompletionDate: new Date(new Date('2024-02-13').toDateString()), actualCompletionDate: new Date(new Date('2024-02-11').toDateString()) },
    { id: '10', name: 'Task 10', effort: 3, plannedCompletionDate: new Date(new Date('2024-02-14').toDateString()), actualCompletionDate: null }
  ];

  options: BurnDownChartOptions = {
    hideLegend: false,
    timeUnit: 'day'
  }
}
