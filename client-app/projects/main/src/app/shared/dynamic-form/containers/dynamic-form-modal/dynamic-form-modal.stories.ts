import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular';
import { DynamicFormModalComponent } from './dynamic-form-modal.component';
import { CustomValidators } from '../../custom-validators/custom-validators';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, switchMap, tap } from 'rxjs';

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

const meta: Meta<DynamicFormModalComponent> = {
  title: 'Dynamic Form Modal',
  component: DynamicFormModalComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'Dynamic Form Modal',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="height: 500px; width: 100%">${story}</div>`)
  ],
  render: (args: DynamicFormModalComponent) => ({
    props: {
      ...args,
      itemMoved: actionsData.itemMoved,
      filterChanged: actionsData.filterChanged,
    },
    template: `<csps-dynamic-form-modal ${argsToTemplate(args)}></csps-dynamic-form-modal>`,
  }),
};

export default meta;
type Story = StoryObj<DynamicFormModalComponent>;

/**
 * Default usage of the data table
 */
export const Default: Story = {
  args: {
    config:{
        headerText: 'Add a new area',
        submitText: 'Add',
        closeText: 'Cancel',
        labelSize: 3,
        onSubmit: (e: any) => { alert(e); },
        onDismiss: (e: any) => { },
        fields: [
          {
            type: 'input',
            label: 'Id',
            name: 'id',
            validation: [
              CustomValidators.required('Area id is required')
            ]
          }
        ]
      }
  },
};

// Input & Number
export const InputAndNumber: Story = {
    args: {
        config: {
            headerText: 'Input',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'input',
                    label: 'Input',
                    placeholder: 'Enter Input Value',
                    name: 'id',
                    validation: [
                        CustomValidators.required('Field is required')
                    ]
                },
                {
                    type: 'input',
                    label: 'Input with Prefilled data',
                    name: 'id1',
                    value: 'Test Data',
                    validation: [
                        CustomValidators.required('Field is required')
                    ]
                },
                {
                    type: 'input',
                    label: 'Input with TypeAhead (Auto Suggestion)',
                    name: 'id2',
                    // While using the type ahead verify the filter you want to have and update accordingly
                    // Update the data as per your requirement
                    // Specify the property you want to use to filter out the data in formatter & typeAhead
                    typeAhead: (text$: Observable<string>) =>
                        text$.pipe(
                          debounceTime(300),
                          distinctUntilChanged(),
                            switchMap(term => of([{ id: 1, name: 'Test 1' }, { id: 2, name: 'Test ABC' }, { id: 3, name: 'input' }].filter(z => z.name.startsWith(term))).pipe(    
                            tap(() => { }),
                            catchError(() => {
                              return of([]);
                            }))
                          ),
                        ),   
                    formatter: (x) => x.name != undefined ? x.name : x,
                    validation: [
                        CustomValidators.required('Field is required')
                    ]
                },
                {
                    type: 'number',
                    label: 'Numeric',
                    name: 'number',
                    validation: [
                        CustomValidators.required('Field Name required')
                    ]
                }
            ]

        }
    },
};

// Password
export const Password: Story = {
    args: {
        config: {
            headerText: 'Password',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'password',
                    label: 'Password',
                    placeholder: 'Enter Password',
                    name: 'id',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

// Select, MultiSelect & MultiSelect List
export const Select: Story = {
    args: {
        config: {
            headerText: 'Select - MultiSelect - MultiSelect List',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'select',
                    label: 'Select Field',
                    name: 'id1',
                    options: [
                        { key: '1', value: 'Op1' },
                        { key: '2', value: 'Op2' },
                        { key: '3', value: 'Op3' },
                        { key: '4', value: 'Op4' },
                    ],
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'select',
                    label: 'Select Field With Pre Selected',
                    name: 'id2',
                    options: [
                        { key: '1', value: 'Op1' },
                        { key: '2', value: 'Op2' },
                        { key: '3', value: 'Op3' },
                        { key: '4', value: 'Op4' },
                    ],
                    value:'3',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'multiSelect',
                    label: 'MultiSelect',
                    name: 'id3',
                    options: [
                        { key: '1', value: 'Op1' },
                        { key: '2', value: 'Op2' },
                        { key: '3', value: 'Op3' },
                        { key: '4', value: 'Op4' },
                    ],
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'multiSelect',
                    label: 'MultiSelect with Prefilled Data',
                    name: 'id4',
                    options: [
                        { key: '1', value: 'Op1' },
                        { key: '2', value: 'Op2' },
                        { key: '3', value: 'Op3' },
                        { key: '4', value: 'Op4' },
                    ],
                    value: '3',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'multiSelectList',
                    label: 'MultiSelect List',
                    name: 'id5',
                    options: [
                        { key: '1', value: 'Op1' },
                        { key: '2', value: 'Op2' },
                        { key: '3', value: 'Op3' },
                        { key: '4', value: 'Op4' },
                    ],
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'multiSelectList',
                    label: 'MultiSelect List with Prefilled data',
                    name: 'id6',
                    options: [
                        { key: '1', value: 'Op1' },
                        { key: '2', value: 'Op2' },
                        { key: '3', value: 'Op3' },
                        { key: '4', value: 'Op4' },
                    ],
                    value: [['2', '3'], ['4']] || [[]]
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

// Checkbox - Checkbox list
export const Checkbox: Story = {
    args: {
        config: {
            headerText: 'Checkbox - Checkbox List',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'checkbox',
                    label: 'CheckBox',
                    name: 'id1',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'checkbox',
                    label: 'CheckBox with Prefilled Value',
                    name: 'id2',
                    value: true
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'checkboxList',
                    label: 'CheckBox List',
                    name: 'id3',
                    checkboxes:[
                        { name: '1', label: 'Box 1', type: 'checkbox' },
                        { name: '2', label: 'Box 2', type: 'checkbox' },
                        { name: '3', label: 'Box 3', type: 'checkbox' },
                    ]
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

// File upload
export const File: Story = {
    args: {
        config: {
            headerText: 'File',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'file',
                    label: 'File',
                    placeholder: 'Upload file',
                    name: 'id',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

// Static & Static Area
export const StaticArea: Story = {
    args: {
        config: {
            headerText: 'Static - Static Area',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'static',
                    label: 'Static',
                    name: 'id1',
                    value:'Static Data'
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'staticArea',
                    label: 'Static Area',
                    name: 'id2',
                    value:'Static Area'
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'area',
                    label: 'Area',
                    name: 'id3',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

// Date & DateTime
export const Date: Story = {
    args: {
        config: {
            headerText: 'Static - Static Area',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'date',
                    label: 'Date',
                    name: 'id1',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'date',
                    label: 'Date Prefilled',
                    name: 'id2',
                    value:'2024-08-02'
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'datetime',
                    label: 'Date Time',
                    name: 'id3',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                },
                {
                    type: 'datetime',
                    label: 'Date Time Prefilled',
                    name: 'id4',
                    value:'2024-08-02T16:48'
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

// ImagePreview
export const ImagePreview: Story = {
    args: {
        config: {
            headerText: 'Image Preview',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'image',
                    label: 'Image Preview',
                    name: 'id1',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

// Form Button
export const FormButton: Story = {
    args: {
        config: {
            headerText: 'Form Button',
            submitText: 'Add',
            closeText: 'Cancel',
            labelSize: 3,
            onSubmit: (e: any) => { alert(e); },
            onDismiss: (e: any) => { },
            fields: [
                {
                    type: 'button',
                    label: 'Button1',
                    name: 'id1',
                    // validation: [
                    //     CustomValidators.required('Field is required')
                    // ]
                }
            ]
        }
    },
};

