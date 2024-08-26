import { faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableToolbarControl } from './model/data-table-toolbar-control.model';

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

const meta: Meta<DataTableComponent<TestData>> = {
  title: 'DataTable',
  component: DataTableComponent<TestData>,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Rich data table',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%">${story}</div>`)
  ],
  render: (args: DataTableComponent<TestData>) => ({
    props: {
      ...args,
      itemMoved: actionsData.itemMoved,
      filterChanged: actionsData.filterChanged,
    },
    template: `<csps-data-table ${argsToTemplate(args)}></csps-data-table>`,
  }),
};

export default meta;
type Story = StoryObj<DataTableComponent<TestData>>;

/**
 * Default usage of the data table
 */
export const Default: Story = {
  args: {
    settings: {
      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i + 1), prop2: 'prop2 - ' + (i + 1), icon:faUser })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '5', label: 'Icon', name: 'icon', type: 'icon', visible: true, searchable: false, filterMode: 'none' },
      ],
      selectableRows: false,
      toolBar: {
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      groupBy: []
    }
  },
};

/**
 * TODO
 */
export const SelectableRows: Story = {
  args: {
    settings: {
      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i + 1), prop2: 'prop2 - ' + (i + 1) })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'none' },
      ],
      selectableRows: true,
      toolBar: {
        left: [
          { name: 'Action 1', type: 'button', icon: faGear, preserveSelection: false, callback: (rows) => alert(`${rows.length} rows selected. No preserve selection`) },
          { name: 'Action 2', type: 'button', icon: faGear, preserveSelection: true, callback: (rows) => alert(`${rows.length} rows selected. Preserve selection`) }
        ],
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      groupBy: []
    }
  }
};

/**
 * TODO
 */
export const DraggableRows: Story = {
  args: {
    settings: {
      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i + 1), prop2: 'prop2 - ' + (i + 1) })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'none' },
      ],
      selectableRows: false,
      toolBar: {
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      draggableRows: true,
      groupBy: []
    }
  }
};

/**
 * TODO
 */
export const SelectableAndDraggableRows: Story = {
  args: {
    settings: {
      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i + 1), prop2: 'prop2 - ' + (i + 1) })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'none' },
      ],
      selectableRows: true,
      toolBar: {
        left: [
          { name: 'Action 1', type: 'button', icon: faGear, preserveSelection: false, callback: (rows) => alert(`${rows.length} rows selected. No preserve selection`) },
          { name: 'Action 2', type: 'button', icon: faGear, preserveSelection: true, callback: (rows) => alert(`${rows.length} rows selected. Preserve selection`) }
        ],
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      draggableRows: true,
      groupBy: []
    }
  }
};

/**
 * TODO
 */
export const FilterableRows: Story = {
  args: {
    settings: {
      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i + 1), prop2: 'prop2 - ' + (i + 1) })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'numeric' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'text' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'select' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'text' },
      ],
      selectableRows: false,
      toolBar: {
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'filter' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      draggableRows: true,
      groupBy: []
    }
  }
};

//export const ErrorRows: Story = {
//  args: {
//    settings: {
//      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i + 1), prop2: 'prop2 - ' + (i + 1),  })),
//      columnDefinitions: [
//        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'numeric' },
//        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'text' },
//        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'select' },
//        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'text' },
//      ],
//      selectableRows: false,
//      toolBar: {
//        right: [
//          { type: 'search' } as DataTableToolbarControl,
//          { type: 'filter' } as DataTableToolbarControl,
//          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
//        ]
//      },
//      draggableRows: true,
//      groupBy: []
//    }
//  }
//};

/**
 * TODO
 */
export const VirtualScrolling: Story = {
  args: {
    settings: {
      data: Array.from({ length: 1000 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i + 1), prop2: 'prop2 - ' + (i + 1) })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'none' },
      ],
      selectableRows: true,
      toolBar: {
        left: [
          { name: 'Action 1', type: 'button', icon: faGear, preserveSelection: false, callback: (rows) => alert(`${rows.length} rows selected. No preserve selection`) },
          { name: 'Action 2', type: 'button', icon: faGear, preserveSelection: true, callback: (rows) => alert(`${rows.length} rows selected. Preserve selection`) }
        ],
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      draggableRows: true,
      groupBy: []
    }
  }
};

/**
 * TODO
 */
export const SingleLevelGrouping: Story = {
  args: {
    settings: {
      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i % 2), prop2: 'prop2 - ' + (i + 1) })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'none' },
      ],
      selectableRows: true,
      cascadeParentSelectionToChildren: true,
      toolBar: {
        left: [
          { name: 'Action 1', type: 'button', icon: faGear, preserveSelection: false, callback: (rows) => alert(`${rows.length} rows selected. No preserve selection`) },
          { name: 'Action 2', type: 'button', icon: faGear, preserveSelection: true, callback: (rows) => alert(`${rows.length} rows selected. Preserve selection`) }
        ],
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      draggableRows: true,
      groupBy: [
        {
          property: 'prop1', orderBy: ['prop1'], columns: [
            { name: 'prop1', type: 'text', alignment: 'left', class: 'red-background', colspan: 4 }
          ]
        }
      ]
    }
  }
};

/**
 * TODO
 */
export const MultiLevelGrouping: Story = {
  args: {
    settings: {
      data: Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: 'test' + (i + 1), prop1: 'prop1 - ' + (i % 2), prop2: 'prop2 - ' + (i % 3) })),
      columnDefinitions: [
        { id: '1', label: 'Id Label', name: 'id', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', label: 'Name Label', name: 'name', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', label: 'Property1 Label', name: 'prop1', type: 'text', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', label: 'Property2 Label', name: 'prop2', type: 'text', visible: true, searchable: false, filterMode: 'none' },
      ],
      selectableRows: true,
      cascadeParentSelectionToChildren: true,
      toolBar: {
        left: [
          { name: 'Action 1', type: 'button', icon: faGear, preserveSelection: false, callback: (rows) => alert(`${rows.length} rows selected. No preserve selection`) },
          { name: 'Action 2', type: 'button', icon: faGear, preserveSelection: true, callback: (rows) => alert(`${rows.length} rows selected. Preserve selection`) }
        ],
        right: [
          { type: 'search' } as DataTableToolbarControl,
          { type: 'button', name: 'Right Action 1', callback: () => alert('Perform Action') },
        ]
      },
      draggableRows: true,
      groupBy: [
        {
          property: 'prop1', orderBy: ['prop1'], columns: [
            { name: 'prop1', type: 'text', alignment: 'left', class: 'red-background', colspan: 4 }
          ]
        },
        {
          property: 'prop2', orderBy: ['prop2'], columns: [
            { name: '', type: 'text', alignment: 'left', class: 'blue-50-background', colspan: 1 },
            { name: 'prop2', type: 'text', alignment: 'left', class: 'blue-50-background', colspan: 3 }
          ]
        }
      ]
    }
  }
};
