import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faCog, faFile, faIndent, faOutdent, faSearch, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ShortenPipe } from '../shorten-pipe/shorten.pipe';
import { TreeviewNode } from '../tree-view/models/tree-view-node.model';
import { TreeviewOptions } from '../tree-view/models/tree-view-option.model';
import { TreeViewComponent } from '../tree-view/tree-view.component';
import { MenuItem } from './model/menu-item.model';
import { QuickLink } from './model/quick-link.model';
import { StickyPopoverDirective } from './sticky-popover.directive';

@Component({
  selector: 'csps-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, ShortenPipe, FontAwesomeModule, FormsModule, NgbTooltipModule, TreeViewComponent, StickyPopoverDirective],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent implements OnInit, AfterViewInit, OnChanges {
  // Search text element
  @ViewChild('search') searchElement!: ElementRef;

  // Tree view component
  @ViewChild(TreeViewComponent) treeview!: TreeViewComponent

  // Icons
  faDefaultIcon: IconDefinition = faFile;
  faCog: IconDefinition = faCog;
  faChevronLeft: IconDefinition = faChevronLeft;
  faChevronRight: IconDefinition = faChevronRight;
  faSearch: IconDefinition = faSearch;
  faTimes: IconDefinition = faTimes;
  faIndent: IconDefinition = faIndent;
  faOutdent: IconDefinition = faOutdent;

  // The list of menu items
  @Input() menuItems: MenuItem[] = [];

  // Indicator to expand tree by default
  @Input() expandedOnStart?: boolean = true;

  // The header text
  @Input() header: string = '';

  // The optional list of quick links
  @Input() quickLinks?: QuickLink[] = [];

  // Active tree nodes
  @Input() activeNodes: string[] = [];

  // Compact mode
  @Input() compactMode?: boolean = false;

  // Advanced search properties
  @Input() advancedSearchProps?: string[] = [];

  // Event fired when a active nodes is updated
  @Output() activeNodesChanged: EventEmitter<string[]> = new EventEmitter<string[]>();


  // The expand/collapse status
  @HostBinding('class.collapsed') collapsed: boolean = false;

  // Indicate whether seach button is clicked
  isSearched: boolean = false;

  // Subject object of filter
  filterSubject$ = new Subject<string>();

  // Filter text
  filterText: string = '';

  // Filterd menu items
  filteredMenuItems: MenuItem[] = [];

  // Used for cleaning subscription 
  unsubscribe: Subject<void> = new Subject();

  // Tree view nodes
  treeviewNodes: TreeviewNode[] = [];

  // The list of menu items to show sticky at bottom
  stickyMenuItems: MenuItem[] = [];

  // The treeview customization options
  options: TreeviewOptions = {
    styles: ['font-weight-bold'],
    expandedOnStart: false,
    showBadgeOnHoverOnly: true,
    showMiniBadges: true,
    allowDrag: false
  };

  // Indicates expand/collase tree toggler status
  allExpanded: boolean = true;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.options.expandedOnStart = !!this.expandedOnStart;
    this.filterSubject$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe)
    ).subscribe(x => this.filterNodes());
  }

  ngAfterViewInit() {
    this.setDefaultActiveNodes();
  }

  ngOnChanges() {
    this.activeNodes = this.activeNodes || [];
    // Clear the treeview
    this.treeviewNodes = [];
    this.filteredMenuItems = this.menuItems.filter(x => !x.stickyBottom);
    // Extract the sticky menu items and ensure default click callback is set if not defined
    this.stickyMenuItems = this.menuItems.filter(x => x.stickyBottom);
    this.stickyMenuItems.forEach(m => {
      const defaultOnClick = () => { };
      m.onClick = m.onClick || defaultOnClick;
    });

    // Build the tree view
    this.convertMenuItemsToTreeviewNodes(this.menuItems.filter(x => !x.stickyBottom), this.treeviewNodes, 1);
  }

  toggleSideBar() {
    this.collapsed = !this.collapsed;
    if (this.collapsed)
      this.collapseAllNodes();
  }

  triggerSearch() {
    this.isSearched = true;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      this.searchElement.nativeElement.focus();
    }, 0);
  }

  resetSearch() {
    this.isSearched = false;
    this.filterText = "";
    this.filterNodes();
  }

  // Filter the nodes
  filterNodes() {
    this.treeview.filterTree(this.filterText, this.advancedSearchProps);
  }

  change(data: any) {
    // Not required here
  }

  // Item clicked, show the content on the right side
  showItem(selectedNode: TreeviewNode) {
    const menuItem: MenuItem | undefined = selectedNode.data.menuItem;

    if (menuItem) {
      this.activeNodesChanged.emit([menuItem.id]);
      this.menuItemClicked(menuItem);
    }
  }

  menuItemClicked(subMenu: MenuItem) {
    const onClick = subMenu.onClick;
    if (onClick)
      onClick(subMenu);

    // Navigate to route if defined
    const route = subMenu.route;
    if (route && route[0])
      this.router.navigate(route, { relativeTo: this.route });
  }

  // Update tree view
  convertMenuItemsToTreeviewNodes(menuItems: MenuItem[], treeNodes: TreeviewNode[], level: number) {
    if (menuItems) {
      menuItems.forEach(menuItem => {
        const node = new TreeviewNode(menuItem.id, menuItem.label, level, null, menuItem.icon, menuItem.badges ? menuItem.badges : [], { menuItem: menuItem, route: menuItem.route, onClick: menuItem.onClick });
        if (menuItem.contextMenu) {
          node.contextMenu = menuItem.contextMenu.map(x => ({
            text: x.text,
            callback: (data: { menuItem: MenuItem }) => x.callback(data.menuItem)
          }));
        }
        if (menuItem.meta)
          node.meta = menuItem.meta;
        treeNodes.push(node);
        if (menuItem.children && menuItem.children.length > 0) {
          this.convertMenuItemsToTreeviewNodes(menuItem.children, node.children, level + 1);
        }
      });
    }
  }

  // Expand all nodes
  expandAllNodes() {
    this.allExpanded = !this.allExpanded;
    this.treeview.expandAllNodes();
  }

  // Collapse all nodes
  collapseAllNodes() {
    this.allExpanded = !this.allExpanded;
    this.treeview.collapseAllNodes();
  }

  // Process menu item click
  processClick(m: MenuItem): void {
    if (m.collpaseOnClick) {
      this.collapsed = true;
      this.collapseAllNodes();
    }

    if (m.onClick)
      m.onClick(m);
  }

  // Process quick link click
  processQuickLinkClick(quickLink: QuickLink): void {
    if (quickLink.onClick)
      quickLink.onClick(quickLink);
  }

  // Keep default active nodes in tree on initial load
  setDefaultActiveNodes() {
    // this.activeNodes.forEach(nodeId => {
    //   this.treeview.treeview.treeModel.getNodeById(nodeId).setActiveAndVisible(true);
    // });
  }
}
