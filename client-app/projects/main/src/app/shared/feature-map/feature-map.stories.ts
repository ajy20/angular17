import { faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { FeatureMapComponent } from './feature-map.component';

//export interface TestData {
//  id: number;
//  name: string;
//  prop1: string;
//  prop2: string;
//}

export const actionsData = {
  featureOpenRequested: action('featureOpenRequested'),
  //  filterChanged: action('filterChanged'),
};

const meta: Meta<FeatureMapComponent> = {
  title: 'FeatureMap',
  component: FeatureMapComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Agile Feature Map',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%">${story}</div>`)
  ],
  render: (args: FeatureMapComponent) => ({
    props: {
      ...args,
      featureOpenRequested: actionsData.featureOpenRequested,
      //  filterChanged: actionsData.filterChanged,
    },
    template: `<csps-feature-map ${argsToTemplate(args)}></csps-feature-map>`,
  }),
};

export default meta;
type Story = StoryObj<FeatureMapComponent>;

/**
 * Default usage of the feature map
 */
export const Default: Story = {
  args: {
    epics: [
      { id: '1', name: 'Prototype #1', features: [{ id: '1', name: 'Feature 1' }] },
      { id: '2', name: 'Prototype #2', features: [{ id: '2', name: 'Feature 2' }, { id: '4', name: 'Feature 4' }] },
      { id: '3', name: 'Epic3', features: [{ id: '3', name: 'Feature 3' }] },
    ],
    programIncrements: [
      { id: '25', name: 'PI 25' },
      { id: '26', name: 'PI 26' },
      { id: '27', name: 'PI 27' },
      { id: '28', name: 'PI 28' }
    ]
  }
};
