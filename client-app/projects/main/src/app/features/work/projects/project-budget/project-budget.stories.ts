import { faFutbol, faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { ProjectBudgetComponent } from './project-budget.component';
 
export interface TestData {
  id: number;
  name: string;
  prop1: string;
  prop2: string;
}

export const actionsData = {
  itemMoved: action('itemMoved'),
  filterChanged: action('filterChanged'),
};

const meta: Meta<ProjectBudgetComponent> = {
  title: 'Project Budget ',
  component: ProjectBudgetComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Rich data table',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%">${story}</div>`)
  ],
  render: (args: ProjectBudgetComponent) => ({
    props: {
      ...args,
      itemMoved: actionsData.itemMoved,
      filterChanged: actionsData.filterChanged,
    },
    template: `<csps-project-budget ${argsToTemplate(args)}></csps-project-budget>`,
  }),
};

export default meta;
type Story = StoryObj<ProjectBudgetComponent>;

/**
 * Default usage of the data table
 */
export const Default: Story = {
  args: {
    
  },
};
