import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartDataset, ChartEvent, ChartOptions, ChartType } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { eachDayOfInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { BurnDownChartOptions } from './model/burn-down-chart-options.model';
import { BurnDownChartTask } from './model/burn-down-chart-task.model';

const MIN_DATE: Date = new Date(0);
const MAX_DATE: Date = new Date('9999-12-31');

@Component({
  selector: 'csps-burn-down-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './burn-down-chart.component.html',
  styleUrl: './burn-down-chart.component.scss'
})
export class BurnDownChartComponent implements OnChanges {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // The list of task to visualize in the burn down chart
  @Input() tasks!: BurnDownChartTask[];

  // The burn down chart options
  @Input() options?: BurnDownChartOptions;

  // The hovered and click event emitters
  @Output() chartClicked: EventEmitter<{ event?: ChartEvent; active?: object[] }> = new EventEmitter<{ event?: ChartEvent; active?: object[] }>();
  @Output() chartHovered: EventEmitter<{ event?: ChartEvent; active?: object[] }> = new EventEmitter<{ event?: ChartEvent; active?: object[] }>();

  // The min and max dates for tasks completion (actual and planned)
  minTaskDate: Date = MIN_DATE;
  maxTaskDate: Date = MAX_DATE;

  // The type of chart
  chartType: ChartType = 'line';

  // The chart configuration
  chartOptions: ChartConfiguration['options'] = {
    scales: {
      x: {
        type: 'time',
        adapters: {
          date: {
            locale: enUS,
          }
        },
        time: {
          isoWeekday: true,
          unit: 'day',
          displayFormats: {
            day: "dd MMM yyyy"
          }
        },
        title: { display: false }
      },
      y: {
        min: 0,
        max: 10
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      }
    }
  };

  // The chart dataset
  public chartDataset: ChartDataset[] = [];

  // Indicates whether to show burn down chart legend, true by default
  showLegend: boolean = true;

  // Chart library does not support SSR (yet?)
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: string) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnChanges(): void {
    this.setMinMax();
    this.setData();
    this.setParameters();
  }

  // Set min/max axis values
  setMinMax(): void {
    this.minTaskDate = new Date(Math.min(
      ...this.tasks.map(t => (t.actualCompletionDate || MAX_DATE).getTime()),
      ...this.tasks.map(t => (t.plannedCompletionDate || MAX_DATE).getTime())
    ));

    this.maxTaskDate = new Date(Math.max(
      ...this.tasks.map(t => (t.actualCompletionDate || MIN_DATE).getTime()),
      ...this.tasks.map(t => (t.plannedCompletionDate || MIN_DATE).getTime())
    ));

    const xAxisOptions = this.chartOptions?.scales?.['x'];
    if (xAxisOptions) {
      (xAxisOptions as any)['time']['unit'] = this.options?.timeUnit || 'day';
      xAxisOptions.min = this.options?.minDateISOString || this.minTaskDate.toISOString();
      xAxisOptions.max = this.options?.maxDateISOString || this.maxTaskDate.toISOString();
    }

    const yAxisOptions = this.chartOptions?.scales?.['y'];
    if (yAxisOptions) {
      yAxisOptions.min = this.options?.minYValue || 0;
      yAxisOptions.max = this.options?.maxYValue;
    }
  }

  // Set the chart data
  setData(): void {
    // Group tasks by completion date
    const groupedTasksByCompletionDate = this.tasks.reduce((acc, t) => {
      if (t.actualCompletionDate) {
        const time = t.actualCompletionDate.getTime();
        acc[time] = acc[time] || { x: time, y: 0, tasks: [] };
        acc[time].y += 1;
        acc[time].tasks.push(t);
      }
      return acc;
    }, {} as { [key: number]: { x: number, y: number, tasks: BurnDownChartTask[] } });

    // Generate the completed task series 
    this.chartDataset.push(
      {
        label: 'Completed Tasks', type: 'bar', data: Object.values(groupedTasksByCompletionDate)
      }
    );

    // Generate the ideal burn down of tasks
    this.chartDataset.push(
      {
        label: 'Ideal Task Burndown', type: 'line', backgroundColor: 'gray', borderColor: 'gray', pointRadius: 0, data: [
          { x: this.minTaskDate.getTime(), y: this.tasks.length },
          { x: this.maxTaskDate.getTime(), y: 0 }
        ]
      }
    );

    // Generate the actual burn down of tasks
    this.chartDataset.push(
      {
        label: 'Actual Task Burndown', type: 'line', pointRadius: 0, data: eachDayOfInterval({ start: this.minTaskDate, end: this.maxTaskDate })
          .reduce((acc, d, i) => {
            const time = new Date(d.toDateString()).getTime()
            acc.push({ x: time, y: (i === 0 ? this.tasks.length : acc[i - 1].y) - (groupedTasksByCompletionDate[time]?.y || 0) })
            return acc;
          }, new Array())
      });
  }

  // Set the chart parameters
  setParameters(): void {
    this.showLegend = !this.options?.hideLegend;

  }

  // Events
  public clicked({ event, active }: { event?: ChartEvent; active?: object[] }): void {
    this.chartClicked.emit({ event, active });
  }

  public hovered({ event, active }: { event?: ChartEvent; active?: object[] }): void {
    this.chartHovered.emit({ event, active });
  }
}

