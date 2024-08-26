import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { BacklogTableComponent } from './backlog-table.component';


export const actionsData = {
  favouriteProductToggled: action('favouriteProductToggled'),
  workItemNavigated: action('workItemNavigated'),
 };

const meta: Meta<BacklogTableComponent> = {
  title: 'Backlog Table ',
  component: BacklogTableComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Backlog table',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%; display:flex">${story}</div>`)
  ],
  render: (args: BacklogTableComponent) => ({
    props: {
      ...args,
      favouriteProductToggled: actionsData.favouriteProductToggled,
      workItemNavigated: actionsData.workItemNavigated
    },
    template: `<csps-backlog-table ${argsToTemplate(args)}></csps-backlog-table>`,
  }),
};

export default meta;
type Story = StoryObj<BacklogTableComponent>;

/**
 * Default usage of the burn down chart
 */
export const Default: Story = {
  args: {
    workItems: [
      { id: '1', name: 'Task 1', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '1', name: 'ECN24-0002 - Update drawings' } },
      { id: '2', name: 'Task 2', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '2', name: 'Unit assembly' }, story: { id: '3', name: '12 Fan' } },
      { id: '3', name: 'Task 3', productLine: { id: '2', name: 'Sales Orders' }, epic: { id: '3', name: 'PDX Tcore CYK' }, feature: { id: '4', name: 'PV Vessels' }, story: { id: '8', name: 'Evaporator' } },
      { id: '4', name: 'Task 4', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '2', name: 'ECN24-0001E - EOM Structure' } },
      { id: '5', name: 'Task 5', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '2', name: 'Unit assembly' }, story: { id: '4', name: '14 Fan' } },
      { id: '6', name: 'Task 6', productLine: { id: '2', name: 'Sales Orders' }, epic: { id: '3', name: 'PDX Tcore CYK' }, feature: { id: '4', name: 'PV Vessels' }, story: { id: '9', name: 'Condenser' } },
      { id: '7', name: 'Task 7', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '3', name: 'System piping' }, story: { id: '5', name: '0041 System Piping' } },
      { id: '8', name: 'Task 8', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '3', name: 'System piping' }, story: { id: '6', name: '0048 System Piping' } },
      { id: '9', name: 'Task 9', productLine: { id: '2', name: 'Sales Orders' }, epic: { id: '4', name: 'University of Texas CYK' }, feature: { id: '6', name: 'System' }, story: { id: '10', name: 'System Layout' } },
      { id: '10', name: 'Task 10', productLine: { id: '1', name: 'YLAA' }, epic: { id: '2', name: 'YLAA Redesign' }, feature: { id: '3', name: 'Compressor Subs' }, story: { id: '7', name: 'Phase 1' } },
      { id: '11', name: 'Task 11', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '1', name: 'ECN24-0002 - Update drawings' } },
      { id: '12', name: 'Task 12', productLine: { id: '1', name: 'YLAA' }, epic: { id: '1', name: 'YLAA Sustaining FY24' }, feature: { id: '1', name: 'Changes to drawings & EOM' }, story: { id: '1', name: 'ECN24-0002 - Update drawings' } },

    ]
  },
};
