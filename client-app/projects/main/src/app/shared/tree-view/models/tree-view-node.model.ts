import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export class TreeviewNode {
  id: string;
  name: string;
  level: number;
  icon: IconDefinition | null;
  badges: { name: string, color: string }[];
  children: TreeviewNode[];
  isLeaf: boolean;
  allowDrop: boolean;
  parent: TreeviewNode | null;
  data: any;
  showBadge?: boolean;
  contextMenu?: { text: string, callback: (data: any) => void }[];
  meta?: { [key: string]: string | string[] };

  get hasChildren() {
    if (this.children.length === 0)
      return false;
    else
      return true;
  }
  constructor(id: string, name: string, level: number, parent: TreeviewNode | null = null, icon: IconDefinition | null = null, badges: { name: string, color: string }[] = [], data: any = {}) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.icon = icon;
    this.badges = badges;
    this.data = data;
    this.children = [];
    this.parent = parent;
    this.isLeaf = true;
    this.allowDrop = true;
  }
}
