import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface DataTableToolbarControl {
  type: 'button' | 'splitButton' | 'dropdown' | 'search' | 'filter' | 'excel' | 'pdf';
  icon?: IconDefinition;
  name: string;
  controls?: DataTableToolbarControl[];
  callback: (data?: any) => void;
  preserveSelection?: boolean;
}
