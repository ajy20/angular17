import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { CdkTree, CdkTreeModule, NestedTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faCaretDown, faCaretRight, faEllipsisV, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeviewNode } from './models/tree-view-node.model';
import { TreeviewOptions } from './models/tree-view-option.model';

@Component({
  selector: 'csps-tree-view',
  standalone: true,
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss',
  imports: [CommonModule, CdkTreeModule, FontAwesomeModule, CdkMenuTrigger, CdkMenu, CdkMenuItem, NgbModule, DragDropModule, CdkDragHandle],
})

export class TreeViewComponent implements OnInit, AfterViewInit {
  // Reference to the tree
  @ViewChild('tree') tree!: CdkTree<TreeviewNode>;

  // The tree data source
  @Input() dataSource: TreeviewNode[] = [];

  // The treeview customization options
  @Input() options!: TreeviewOptions

  // Event fired when a tree node is moved
  @Output() onNodeMoved: EventEmitter<TreeviewNode[]> = new EventEmitter<TreeviewNode[]>();

  // Event fired when a tree node is selected
  @Output() onNodeSelected: EventEmitter<TreeviewNode> = new EventEmitter<TreeviewNode>();

  // Icons
  faEllipsisV: IconDefinition = faEllipsisV;
  faCaretRight: IconDefinition = faCaretRight;
  faCaretDown: IconDefinition = faCaretDown;
  faBars: IconDefinition = faBars;

  // Nested tree control
  treeData: TreeviewNode[] = [];
  treeControl = new NestedTreeControl<TreeviewNode>(node => node.children);

  // Expansion model tracks expansion state and other drag and drop properties
  expansionModel = new SelectionModel<string>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = false;

  constructor() { }

  // Helper function
  hasChild = (_: number, node: TreeviewNode) => !!node.children && node.children.length > 0;

  ngOnInit() {
    // Initialization of the dataSource and treeControl dataNodes
    this.treeData = this.dataSource;
    this.treeControl.dataNodes = this.dataSource;
  }

  ngAfterViewInit() {
    if (this.tree && this.options.expandedOnStart) {
      setTimeout(() => {
        this.expandAllNodes();
      });
    }
  }

  // Function to check if all nodes are expanded
  areAllNodesExpanded(): boolean {
    return this.dataSource.every(node => this.treeControl.isExpanded(node));
  }

  expandAllNodes(): void {
    this.treeControl.expandAll();
  }

  collapseAllNodes(): void {
    this.treeControl.collapseAll();
  }

  moveExpansionState(from: TreeviewNode, to: TreeviewNode) {
    if (this.treeControl.isExpanded(from)) {
      this.treeControl.collapse(from);
      this.treeControl.expand(to);
    }
  }

  processClick(node: TreeviewNode) {
    this.onNodeSelected.emit(node);
  }

  // Handle the drop event
  drop(event: CdkDragDrop<string[]>) {
    // Ignore drops outside of the tree
    if (!event.isPointerOverContainer || !this.options.allowDrag) return;

    // Construct a list of visible nodes, this will match the DOM.
    // The cdkDragDrop event.currentIndex jives with visible nodes.
    // It calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.getVisibleNodes();

    // Dep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource));

    // Recursive find function to find siblings of node
    const findNodeSiblings = (arr: any[], id: string): any[] => {
      let result: any[] | undefined;
      arr.forEach((item) => {
        if (item.id === id) {
          result = arr;
        } else if (item.children && item.children.length) {
          const subResult = findNodeSiblings(item.children, id);
          if (subResult && subResult.length) result = subResult;
        }
      });
      return result || [];
    };

    // Determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex];
    const newSiblings = findNodeSiblings(changedData, nodeAtDest.id);
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex(s => s.id === nodeAtDest.id);

    // Remove the node from its old place
    const node = event.item.data;
    const siblings = findNodeSiblings(changedData, node.id);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    const nodeToInsert: TreeviewNode = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest.id === nodeToInsert.id) return;

    // Ensure validity of drop - must be same level
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest.id === n.id) as TreeviewNode;
    if (this.validateDrop && nodeAtDestFlatNode.level !== node.level) {
      alert('Items can only be moved within the same level.');
      return;
    }

    // Insert node 
    newSiblings.splice(insertIndex, 0, nodeToInsert);

    // Rebuild tree with mutated data
    this.rebuildTreeForData(changedData);
  }

  dragStart() {
    this.dragging = true;
  }

  dragEnd() {
    this.dragging = false;
  }

  dragHover(node: TreeviewNode) {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = setTimeout(() => {
        this.treeControl.expand(node);
      }, this.expandDelay);
    }
  }

  dragHoverEnd() {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
    }
  }

  // Generates the list of visible nodes
  getVisibleNodes(): TreeviewNode[] {
    const result: TreeviewNode[] = [];

    const addExpandedChildren = (node: TreeviewNode, expanded: string[]) => {
      result.push(node);
      if (node.children && expanded.includes(node.id)) {
        node.children.forEach((child: TreeviewNode) => addExpandedChildren(child, expanded));
      }
    };

    this.dataSource.forEach(node => {
      addExpandedChildren(node, this.expansionModel.selected);
    });

    return result;
  }

  // Force the rebuild of the tree, preserving the expansion state
  rebuildTreeForData(data: any) {
    this.dataSource = [...data];
    this.expansionModel.selected.forEach(id => {
      const node = this.treeControl.dataNodes.find(n => n.id === id) as TreeviewNode;
      this.treeControl.expand(node);
    });
  }

  // Filter the tree
  filterTree(filter: string, searchProps?: string[]) {
    if (filter.length) {
      const customFilter = (node: TreeviewNode, searchValue: string): boolean => {
        // Check if the node name matches the search value
        if (node.name.toLowerCase().includes(searchValue.toLowerCase())) {
          return true;
        }
        // Check if any of the search properties match the search value
        if (searchProps && searchProps.length > 0) {
          for (const prop of searchProps) {
            if (node[prop as keyof TreeviewNode] && typeof node[prop as keyof TreeviewNode] === 'string' && node[prop as keyof TreeviewNode].toLowerCase().includes(searchValue.toLowerCase())) {
              return true;
            }
          }
        }
        return false;
      };

      const filteredNodes: TreeviewNode[] = [];

      const filterNodes = (nodes: TreeviewNode[]) => {
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            const filteredChildren: TreeviewNode[] = [];
            for (const child of node.children) {
              if (customFilter(child, filter)) {
                filteredChildren.push(child);
              }
            }
            if (filteredChildren.length > 0) {
              const parentNode = { ...node, children: filteredChildren } as TreeviewNode;
              filteredNodes.push(parentNode);
            }
            filterNodes(node.children);
          }
        }
      };

      filterNodes(this.dataSource);
      this.dataSource = filteredNodes;
      this.treeControl.dataNodes = this.dataSource;
      this.treeControl.expandAll();
    } else {
      this.dataSource = this.treeData;
      this.treeControl.dataNodes = this.dataSource;
      this.treeControl.expandAll();
    }
  }
}
