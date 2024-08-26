import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { BurnDownChartComponent } from './burn-down-chart.component';



export const actionsData = {
  chartClicked: action('chartClicked'),
  chartHovered: action('chartHovered'),
};

const meta: Meta<BurnDownChartComponent> = {
  title: 'Burn Down Chart ',
  component: BurnDownChartComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Burn down chart',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%; display:flex">${story}</div>`)
  ],
  render: (args: BurnDownChartComponent) => ({
    props: {
      ...args,
      chartClicked: actionsData.chartClicked,
      chartHovered: actionsData.chartHovered,
    },
    template: `<csps-burn-down-chart ${argsToTemplate(args)}></csps-burn-down-chart>`,
  }),
};

export default meta;
type Story = StoryObj<BurnDownChartComponent>;

/**
 * Default usage of the burn down chart
 */
export const Default: Story = {
  args: {
    tasks: [
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
    ]     
  },
};
