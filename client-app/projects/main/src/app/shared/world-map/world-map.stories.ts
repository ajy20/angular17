import { APP_INITIALIZER } from '@angular/core';
import { action } from '@storybook/addon-actions';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { ThemeService } from '../theme/theme.service';
import { WorldMapComponent } from './world-map.component';

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

const meta: Meta<WorldMapComponent> = {
  title: 'World Map',
  component: WorldMapComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'An interactive world map',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%">${story}</div>`),
  ],
  render: (args: WorldMapComponent) => ({
    props: {
      ...args,
    },
    template: `<csps-world-map ${argsToTemplate(args)}></csps-world-map>`,
  }),
};

export default meta;
type Story = StoryObj<WorldMapComponent>;

/**
 * Default usage of the world map
 */
export const Default: Story = {
  args: {
    coordinates: [
      { id: '1', city: 'Paris', lat: 48.864716, long: 2.349014, color: '#123456', click: () => { alert('You selected Paris'); } },
      { id: '2', city: 'New York', lat: 40.730610, long: - 73.935242, color: '#ca2339', click: () => { alert('You selected New York'); } },
    ],
    flows: [],
    selectedContinents: new Map([
      ['Europe', { color: '#ff0000' }],
      ['North America', { color: '#0000ff' }],
      ['Africa', { color: '#f000ff' }],
      ['Middle East', { color: '#000fff' }],
      ['Latin America', { color: '#00ff00' }],
      ['Asia', { color: '#a2f2a2' }],
      ['Oceania', { color: '#aa88aa' }],
    ])
  },
};
