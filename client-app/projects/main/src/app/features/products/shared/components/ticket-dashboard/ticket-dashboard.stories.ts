import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { TicketDashboardComponent } from './ticket-dashboard.component';


export const actionsData = {
  ticketNavigated: action('ticketNavigated'),
  productNavigated: action('productNavigated'),
  documentOpened: action('documentOpened'),
  ticketAdded: action('ticketAdded'),
  // TODO
};

const meta: Meta<TicketDashboardComponent> = {
  title: 'Ticket Dashboard',
  component: TicketDashboardComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Ticket Dashboard',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%; display:flex">${story}</div>`)
  ],
  render: (args: TicketDashboardComponent) => ({
    props: {
      ...args,
      ticketNavigated: actionsData.ticketNavigated,
      productNavigated: actionsData.productNavigated,
      documentOpened: actionsData.documentOpened,
      ticketAdded: actionsData.ticketAdded
    },
    template: `<csps-ticket-dashboard ${argsToTemplate(args)}></csps-ticket-dashboard>`,
  }),
};

export default meta;
type Story = StoryObj<TicketDashboardComponent>;

/**
 * Default usage of the ticket dashboard
 */
export const Default: Story = {
  args: {
    tickets: [
      { id: '1', name: 'Ticket 1', productLine: { id: '1', name: 'YLAA' }, ecn: 'ECN24-1234' },
      { id: '2', name: 'Ticket 2', productLine: { id: '1', name: 'YLAA' }, },
      { id: '3', name: 'Ticket 3', productLine: { id: '2', name: 'YMC2' }, },
      { id: '4', name: 'Ticket 4', productLine: { id: '3', name: 'YK' }, },
      { id: '5', name: 'Ticket 5', productLine: { id: '2', name: 'YMC2' }, },
      { id: '6', name: 'Ticket 6', productLine: { id: '1', name: 'YLAA' }, },
    ],
    options: {} 
  },
};
