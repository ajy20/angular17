import { TreeviewNode } from "./tree-view-node.model";

export class TreeviewOptions {
  // Indicates whether nodes should all be expanded on start
  expandedOnStart: boolean = false;

  // Array containing css classes to apply to nodes of the corresponding level
  // Item 0 correspond to level 1 nodes, item 1 to level 2 nodes,...
  styles?: string[] = [];

  // Indicates if badges should be shown on hover only
  showBadgeOnHoverOnly?: boolean = false;

  // Indicates where mini badges should be shown when node is not hovered
  showMiniBadges?: boolean = false;

  // Indicates whether the tree should display checkboxes in front of each node
  useCheckbox?: boolean;

  // Options to allow for drag and drop
  allowDrag?: boolean = false;
  allowDrop?: (element: any, to: { parent: TreeviewNode, index: number }, $event?: any) => boolean;

  // // Action Mappings
  // actionMapping?: IActionMapping;
}
