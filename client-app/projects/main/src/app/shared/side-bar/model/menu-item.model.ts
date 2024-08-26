import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface MenuItem {
  id: string;
  label: string;
  active?: boolean;
  icon?: IconDefinition;
  onClick?: (e: MenuItem) => void;
  route?: string[];
  children?: MenuItem[];
  badges?: { name: string, color: string }[];
  stickyBottom?: boolean;
  collpaseOnClick?: boolean;
  contextMenu?: { text: string, callback: (menuItem: MenuItem) => void }[];
  data?: any;
  meta?: { [key: string]: string | string[] };
}
