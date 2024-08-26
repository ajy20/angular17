import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faBalanceScale, faCheck, faCircle as faCircleSolid, faDotCircle, faEdit, faExclamationCircle, faEye, faFilter, faList, faPlus, faSearch, faStickyNote, faTrash, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { constants } from '../../../../../shared/constants/constants';
import { DataTableComponent } from '../../../../../shared/data-table/data-table.component';
import { DataTableColumnDefinition } from '../../../../../shared/data-table/model/data-table-column-definition.model';
import { DataTableColumn } from '../../../../../shared/data-table/model/data-table-column.model'; import { DataTableSettings } from '../../../../../shared/data-table/model/data-table-settings.model';
import { DataTableToolbarControl } from '../../../../../shared/data-table/model/data-table-toolbar-control.model';
import { NotificationConfig } from '../../../../../shared/dynamic-form/models/notification-config.interface';
import { DynamicFormService } from '../../../../../shared/dynamic-form/services/dynamic-form.service';
import { LexicalRankService } from '../../../../../shared/lexical-rank/lexical-rank.service';
import { Dimension } from '../../../shared/models/dimensions/dimension.model';
import { ProductFeatureListTableFactory } from './model/product-feature-list-table-factory.model';
import { ProductFeatureListTableFeature } from './model/product-feature-list-table-feature.model';
import { ProductFeatureListTableOption } from './model/product-feature-list-table-option.model';
import { ProductFeatureListTableOptions } from './model/product-feature-list-table-options.model';
import { ProductFeatureListTableStyle } from './model/product-feature-list-table-style.model';

export interface optionLookupMap {
  [key: string]: ProductFeatureListTableOption & { feature: ProductFeatureListTableFeature }
}


@Component({
  selector: 'csps-product-feature-list-table',
  standalone: true,
  imports: [DataTableComponent, FontAwesomeModule],
  templateUrl: './product-feature-list-table.component.html',
  styleUrl: './product-feature-list-table.component.scss'
})
export class ProductFeatureListTableComponent implements OnInit, OnChanges, OnDestroy {
  // The list of features
  @Input() features!: ProductFeatureListTableFeature[];

  // The list of factories
  @Input() factories!: ProductFeatureListTableFactory[];

  // The list of dimensions
  @Input() dimensions!: Dimension[];

  // The list of styles
  @Input() styles!: ProductFeatureListTableStyle[];

  // The optional feature list table options
  @Input() tableOptions?: ProductFeatureListTableOptions;

  // Emits whenever a feature is moved
  @Output() featureMoved: EventEmitter<{ id: string, rank: string }> = new EventEmitter<{ id: string, rank: string }>();

  // Emits whenever an option is moved
  @Output() optionMoved: EventEmitter<{ featureId: string, id: string, rank: string }> = new EventEmitter<{ featureId: string, id: string, rank: string }>();

  // Emits whenever a feature is deleted
  @Output() featureDeleted: EventEmitter<{ id: string }> = new EventEmitter<{ id: string }>();

  // Emits whenever an option is deleted
  @Output() optionDeleted: EventEmitter<{ featureId: string, id: string }> = new EventEmitter<{ featureId: string, id: string }>();

  // Emits whenever an option is activated
  @Output() optionsActivated: EventEmitter<{ featureId: string, optionId: string }[]> = new EventEmitter<{ featureId: string, optionId: string }[]>();

  // Emits whenever an option is deactivated
  @Output() optionsDeactivated: EventEmitter<{ featureId: string, optionId: string }[]> = new EventEmitter<{ featureId: string, optionId: string }[]>();

  // Emits whenever an option is released to a factory
  @Output() optionsReleasedToFactory: EventEmitter<{ options: { featureId: string, optionId: string }[], factoryId: string }> = new EventEmitter<{ options: { featureId: string, optionId: string }[], factoryId: string }>();

  // Emits whenever an option is unreleased from a factory
  @Output() optionsUnreleasedFromFactory: EventEmitter<{ options: { featureId: string, optionId: string }[], factoryId: string }> = new EventEmitter<{ options: { featureId: string, optionId: string }[], factoryId: string }>();

  // Emits whenever the feature analyzer is opened
  @Output() featureAnalyzerOpened: EventEmitter<null> = new EventEmitter<null>();

  // Emits whenever the feature importer is opened
  @Output() featureImporterOpened: EventEmitter<null> = new EventEmitter<null>();

  // Emits whenever the option importer is opened
  @Output() optionImporterOpened: EventEmitter<string> = new EventEmitter<string>();

  // The datatable settings
  settings!: DataTableSettings<ProductFeatureListTableFeature>

  // The selected style filter
  styleFilter$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  // Used for cleaning subscriptions
  private unsubscribe: Subject<void> = new Subject();

  constructor(private dynamicFormService: DynamicFormService, private lexicalRankService: LexicalRankService) { }

  ngOnInit(): void {
    const observables = [
      //this.data$.pipe(takeUntil(this.unsubscribe)),
      this.styleFilter$.pipe(takeUntil(this.unsubscribe))
    ];

    combineLatest(...observables).pipe(takeUntil(this.unsubscribe)).subscribe(([data, styleIdFilter]) => {
      // TODO
      // Filter based on style filter
      //this.generateDataTableSettings(data);
    });
  }

  ngOnChanges(): void {
    // Create an option lookup
    const optionLookup: optionLookupMap = this.features.reduce((acc, f) => {
      f.options.forEach(o => {
        acc[o.id] = { ...o, feature: f };
      });
      return acc;
    }, {} as optionLookupMap);


    // Enrich list of features
    const data = this.features
      //.filter(f => !f.styleRestrictions || !f.styleRestrictions.length || !styleIdFilter || f.styleRestrictions.includes(styleIdFilter))
      .sort(this.lexicalRankService.lexicalRankSorter())
      .reduce((acc, f) => {
        const featureMetaData = {
          addIcon: f.isNumeric || f.isFreeText || f.isAutoGenerated ? null : faPlus,
          editIcon: f.isAutoGenerated ? null : faEdit,
          deleteIcon: f.isAutoGenerated ? null : faTrash,
          warning:
            !this.factories.every(factory => f.options.some(o => o.releases.some(r => r.factoryId === factory.id))) ||
              (f.isArray && f.arraySize?.featureId === constants.emptyGuid && f.arraySize?.size === 0) ||
              f.options.some(o => o.releases.some(r => r.asSQ && !r.sqRules?.rules?.length && !r.unavailableRules?.rules?.length && !r.contractRules?.rules?.length)) ?
              faExclamationCircle : '',
          fullName: `${f.name} - ${f.description} ${f.isArray ? (' (Array Feature' + (f.arraySize?.featureId !== constants.emptyGuid && f.arraySize?.featureId?.length ? ' - size constrained by ' + this.features.find(g => g.id === f.arraySize?.featureId)?.name : '') + (f.arraySize?.size ? ' - ' + f.arraySize.size + ' elements max' : '')) + ')' : ''}`,
          dimension: this.dimensions.find(d => d.id === f.dimensionId),
          typeIcon: f.isNumeric ? faBalanceScale : (f.isFreeText ? faEdit : faList),
          restrictionIcon: f.styleRestrictions?.length ? faEye : null,
          restrictedStyles: this.styles.filter(s => f.styleRestrictions?.includes(s.id)).map(s => s.name).join(', '),
          noteIcon: faStickyNote
        };
        if (!f.options?.length)
          acc.push({ isPlaceholder: true, feature: { ...f, ...featureMetaData } });
        else {
          const { options, ...cleanedFeature } = f;
          const opts = f.options.sort(this.lexicalRankService.lexicalRankSorter()).map(o => ({ ...o, feature: { ...cleanedFeature, ...featureMetaData } }));
          acc.push(...opts);
        }
        return acc;
      }, new Array());

    //this.data$.next(data);
    this.generateDataTableSettings(data);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  generateDataTableSettings(data:any[]): void {
    this.settings = {
      selectableRows: true,
      cascadeParentSelectionToChildren: true,
      draggableRows: true,
      data: data.map(o =>
      ({
        ...o,
        fullName: o.feature.isNumeric ? `${o.feature.dimension.name} (${o.feature.dimension.metric.symbol} | ${o.feature.dimension.english.symbol})` :
          o.feature.isFreeText ? `Free text` : `${o.name} - ${o.description}`,
        type: o.feature.typeIcon,
        activeIcon: o.isActive ? faCircleSolid : faCircle,
        ...this.factories.reduce((acc, f) => {
          var release = o.releases?.find((r:any) => r.factoryId === f.id);
          acc[f.id] = !release ? faCircle : (release.asSQ ? faDotCircle : faCircleSolid);
          return acc;
        }, {} as { [key: string]: IconDefinition }),
        deleteIcon: o.feature.isNumeric || o.feature.isFreeText || o.isAutoGenerated ? null : faTrash,
        editIcon: o.feature.isNumeric || o.feature.isFreeText || o.isAutoGenerated ? null : faEdit
      })
      ), 
      hideRow: (row: any) => row.isPlaceholder,
      columnDefinitions: [
        { id: '1', name: '', label: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '2', name: '', label: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '2.1', name: '', label: '', type: 'text', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '3', name: 'type', label: '', type: 'icon', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '4', name: 'fullName', label: '', type: 'text', cellAlignment: 'left', visible: true, searchable: true, filterMode: 'text' },
        { id: '5', name: 'restrictionIcon', label: '', type: 'icon', columnClass: 'fit', visible: true, searchable: false, filterMode: 'none' },
        { id: '6', name: 'restrictedStyles', label: 'Style Restriction', type: 'text', columnClass: 'w-15', cellAlignment: 'left', visible: true, searchable: false, filterMode: 'text' },
        { id: '7', name: 'activeIcon', label: 'Active', type: 'icon', columnClass: 'w-5', cellClass: this.iconColor.bind(this, 'active'), visible: true, searchable: false, filterMode: 'none', click: this.viewActivationStatus.bind(this) },
        ...this.factories.map((x, i) => ({ id: '8.' + (i + 1), label: x.abbreviation, type: 'icon', name: x.id, cellClass: this.iconColor.bind(this, x.id), columnClass: 'w-5', visible: true, searchable: false, filterMode: 'none', click: this.viewReleaseStatus.bind(this, x.id) }) as DataTableColumnDefinition),
        { id: '9', name: 'deleteIcon', label: 'Delete', type: 'icon', columnClass: 'w-5', visible: true, searchable: false, filterMode: 'none', click: this.deleteOption.bind(this) },
        { id: '10', name: 'editIcon', label: 'Edit', type: 'icon', columnClass: 'w-5', visible: true, searchable: false, filterMode: 'none', click: this.editOption.bind(this) }
      ],
      toolBar: {
        left: [
          { name: 'Activate options', type: 'button', icon: faCheck, callback: this.activateOptions.bind(this), preserveSelection: true },
          { name: 'Deactivate options', type: 'button', icon: faCheck, callback: this.deactivateOptions.bind(this), preserveSelection: true },
          ...this.factories.map((f) => ({
            name: f.name, type: 'dropdown', icon: faCheck, callback: () => { }, controls: [
              { name: 'Activate', type: 'button', callback: (rows) => this.releaseOptionsToFactory(rows, f.id, false), preserveSelection: true } as DataTableToolbarControl,
              ...this.tableOptions?.canReleaseWithRestrictions ? [{ name: 'Activate with restrictions', type: 'button', callback: (rows) => this.releaseOptionsToFactory(rows, f.id, true), preserveSelection: true } as DataTableToolbarControl] : [],
              { name: 'Deactivate', type: 'button', callback: (rows) => this.unreleaseOptionsFromFactory(rows, f.id), preserveSelection: true } as DataTableToolbarControl,
            ]
          } as DataTableToolbarControl))
        ],
        right: [
          { name: 'Search', type: 'search', callback: () => { } },
          { name: 'Feature Analyzer', type: 'button', icon: faSearch, callback: this.showFeatureAnalyzer.bind(this) },
          {
            name: 'Filter Styles', type: 'dropdown', icon: faFilter, controls: [
              { name: 'Clear Filter', type: 'button', callback: this.clearStyleFilter.bind(this) },
              ... this.styles.map(s => ({ name: s.name, type: 'button', callback: this.filterStyles(s) } as DataTableToolbarControl))]
          } as DataTableToolbarControl,
          { name: 'Add Feature(s)', type: 'button', icon: faPlus, callback: this.addFeatures.bind(this) }
        ]
      },
      groupBy: [
        {
          property: 'feature.category.name',
          orderBy: ['feature.category.name'],
          rowClass: 'blue-50-background',
          columns: [
            { name: 'feature.category.name', type: 'text', class: 'text-uppercase font-weight-bold', colspan: 10 + this.factories.length, searchable: true, alignment: 'left' },
          ]
        },
        {
          property: 'feature.id',
          orderBy: ['feature.rank'],
          columns: [
            { name: 'feature.addIcon', type: 'icon', class: 'gray-text', colspan: 1, click: this.addOption.bind(this) }, //...!this.readOnlyMode ?   : []
            { name: 'feature.warning', type: 'icon', class: 'red-text', colspan: 1, click: this.showFeatureWarning.bind(this) }, //...!this.readOnlyMode ?   : []
            { name: 'feature.noteIcon', type: 'icon', class: this.iconColor.bind(this, 'notes'), searchable: false, colspan: 1, click: this.editFeatureNotes.bind(this) }, // trigger modal w/ text area (+ eventually feature comments)
            { name: 'feature.fullName', type: 'text', class: 'blue-text font-weight-bold', searchable: true, alignment: 'left', colspan: 2 },
            { name: 'feature.restrictionIcon', type: 'icon', class: 'blue-text font-weight-bold', searchable: false, alignment: 'left', colspan: 1 },
            { name: 'feature.restrictedStyles', type: 'text', class: 'blue-text font-weight-bold', searchable: false, alignment: 'left', colspan: 2 + this.factories.length },
            { name: 'feature.deleteIcon', type: 'icon', searchable: false, colspan: 1, click: this.deleteFeature.bind(this) },
            { name: 'feature.editIcon', type: 'icon', searchable: false, colspan: 1, click: this.editFeature.bind(this) }
          ]
        }
      ]
    }
  }

  private iconColor(column: string, data: any): string {
    if (column === 'active')
      return data.isActive ? 'green-text' : '';
    else if (column === 'notes') {
      const feature = this.features.find(f => f.id === data.feature.id);
      return feature?.notes?.trim().length ? 'blue-text' : 'gray-text';
    }
    else {
      // Locate release for corresponding factory
      const release = data.releases.find((r: any) => r.factoryId === column);

      return !release ? '' :  // No release
        !release.asSQ ? 'green-text' :   // Fully released
          release.sqRules?.rules?.length || release.unavailableRules?.rules?.length || release.contractRules?.rules?.length ? 'orange-text' : // Released with  restrictions
            'gray-text';  // Error (missing rules) is caught in the warning
    }
  }

  // Set the style filter
  filterStyles(style: { id: string, name: string }): () => void {
    return () => {
      this.styleFilter$.next(style.id);
    }
  }

  // Clear the style filter
  clearStyleFilter(): void {
    this.styleFilter$.next(null);
  }

  // Add features
  addFeatures(): void {

  }

  // Edit a feature 
  editFeature(rowData: any): void {

  }

  // Edit the feature notes
  editFeatureNotes(rowData: any): void {

  }

  showFeatureWarning(rowData: any): void {

  }

  manageStyleRestriction(featureData: ProductFeatureListTableFeature): void {

  }

  // Delete a feature
  deleteFeature(rowData: any): void {
    // Retrieve the full data about the feature
    const featureData = this.features.find(f => f.id === rowData.feature.id);

    if (featureData) {
      const config: NotificationConfig = {
        headerText: `Delete feature ${featureData.name}`,
        submitText: 'Delete',
        closeText: 'Cancel',
        onSubmit: () => this.featureDeleted.emit({ id: featureData.id }),
        notifications: [
          `Are you sure you want to delete feature ${featureData.name}?`,
          ...featureData.options.length ? [`This will also delete the ${featureData.options.length} option(s) belonging to this feature.`] : [],
          `This operation is irreversible and cannot be undone.`
        ]
      };

      this.dynamicFormService.popNotification(config);
    }
  }

  // Add options
  addOption(rowData: any): void {

  }

  // Update option properties
  editOption(rowData: any): void {

  }

  // View option activation
  viewActivationStatus(rowData: any): void {

  }

  // View the option release status
  viewReleaseStatus(factoryId: string, rowData: any): void {

  }

  // Delete option
  deleteOption(rowData: any): void {
    const config: NotificationConfig = {
      headerText: `Delete option ${rowData.name}`,
      submitText: 'Delete',
      closeText: 'Cancel',
      onSubmit: () => this.optionDeleted.emit({ featureId: rowData.feature.id, id: rowData.id }),
      notifications: [
        `Are you sure you want to delete option ${rowData.name}?`,
        `This operation is irreversible and cannot be undone.`,
      ]
    };

    this.dynamicFormService.popNotification(config);
  }

  // Activate a set of options
  activateOptions(rows: any[]): void {
    // Retrieve all options to be activated
    const optionsToActivate = rows.filter(x => x.level === 3 && !x.data?.isActive);

    if (optionsToActivate?.length)
      this.optionsActivated.emit(optionsToActivate.map(y => ({ featureId: y.data?.feature.id, optionId: y.data?.id })));
  }

  // Deactivate a set of options
  deactivateOptions(rows: any[]): void {
    // Retrieve all options to be activated
    const optionsToDeactivate = rows.filter(x => x.level === 3 && x.data?.isActive);

    if (optionsToDeactivate?.length)
      this.optionsDeactivated.emit(optionsToDeactivate.map(y => ({ featureId: y.data?.feature.id, optionId: y.data?.id })));
  }

  // Release a set of options to a factory
  releaseOptionsToFactory(rows: any[], factoryId: string, sq: boolean): void {
    // Retrieve all options to release
    const optionsToRelease = rows.filter(x => x.level === 3 && !x.data?.releases.some((r: any) => r.factoryId === factoryId));

    if (optionsToRelease?.length)
      this.optionsReleasedToFactory.emit({ options: optionsToRelease.map(y => ({ featureId: y.data?.feature.id, optionId: y.data?.id, asSQ: sq })), factoryId: factoryId });
  }

  // Unrelease a set of options from a factory
  unreleaseOptionsFromFactory(rows: any[], factoryId: string): void {
    // Retrieve all options to release
    const optionsToUnrelease = rows.filter(x => x.level === 3 && x.data?.releases.some((r: any) => r.factoryId === factoryId));

    if (optionsToUnrelease?.length)
      this.optionsUnreleasedFromFactory.emit({ options: optionsToUnrelease.map(y => ({ featureId: y.data?.feature.id, optionId: y.data?.id })), factoryId: factoryId });
  }

  // Update option SQ Rules
  updateOptionSqRules(rowData: any, factoryId: string): void {
    // Retrieve the full data about the option
    //const optionRelease = rowData?.releases.find(r => r.factoryId === factoryId);
    //this.dynamicFormService.popModal(ConditionTableBuilderModalComponent, {
    //  title: 'Condition Table Builder',
    //  features: this.selectedVersion.features.filter(x => x.id !== rowData?.feature.id),
    //  rules: this.rules,
    //  values: optionRelease?.sqRules?.rules?.map(r => ({ value: true, conditions: r.map(o => ({ optionId: o })) })) || [],
    //  readOnly: false,
    //  renderer: 'check',
    //  onSubmit: (data: { conditions: { optionId: string }[], value: any }[]) => {
    //    const rules = data.map(x => x.conditions.map(o => o.optionId));
    //    this.featureListService.updateOptionReleaseSqRules(this.selectedVersion?.id, rowData?.feature.id, rowData.id, factoryId, rules).pipe(take(1)).subscribe();
    //  },
    //  onDismiss: (e: string) => {
    //    if (e === 'Clear')
    //      this.featureListService.updateOptionReleaseSqRules(this.selectedVersion?.id, rowData?.feature.id, rowData.id, factoryId, []).pipe(take(1)).subscribe();
    //  }
    //});
  }

  // Update option unavailable Rules
  updateOptionUnavailableRules(rowData: any, factoryId: string): void {
    // Retrieve the full data about the option
    //const optionRelease = rowData?.releases.find(r => r.factoryId === factoryId);
    //this.dynamicFormService.popModal(ConditionTableBuilderModalComponent, {
    //  title: 'Condition Table Builder',
    //  features: this.selectedVersion.features.filter(x => x.id !== rowData?.feature.id),
    //  rules: this.rules,
    //  values: optionRelease?.unavailableRules?.rules?.map(r => ({ value: true, conditions: r.map(o => ({ optionId: o })) })) || [],
    //  readOnly: false,
    //  renderer: 'check',
    //  onSubmit: (data: { conditions: { optionId: string }[], value: any }[]) => {
    //    const rules = data.map(x => x.conditions.map(o => o.optionId));
    //    this.featureListService.updateOptionReleaseUnavailableRules(this.selectedVersion?.id, rowData?.feature.id, rowData.id, factoryId, rules).pipe(take(1)).subscribe();
    //  },
    //  onDismiss: (e: string) => {
    //    if (e === 'Clear')
    //      this.featureListService.updateOptionReleaseUnavailableRules(this.selectedVersion?.id, rowData?.feature.id, rowData.id, factoryId, []).pipe(take(1)).subscribe();
    //  }
    //});
  }

  // Update option contract Rules
  updateOptionContractRules(rowData: any, factoryId: string): void {
    // Retrieve the full data about the option
    //const optionRelease = rowData?.releases.find(r => r.factoryId === factoryId);
    //this.dynamicFormService.popModal(ConditionTableBuilderModalComponent, {
    //  title: 'Condition Table Builder',
    //  features: this.selectedVersion.features.filter(x => x.id !== rowData?.feature.id),
    //  rules: this.rules,
    //  values: optionRelease?.contractRules?.rules?.map(r => ({ value: true, conditions: r.map(o => ({ optionId: o })) })) || [],
    //  readOnly: false,
    //  renderer: 'check',
    //  onSubmit: (data: { conditions: { optionId: string }[], value: any }[]) => {
    //    const rules = data.map(x => x.conditions.map(o => o.optionId));
    //    this.featureListService.updateOptionReleaseContractRules(this.selectedVersion?.id, rowData?.feature.id, rowData.id, factoryId, rules).pipe(take(1)).subscribe();
    //  },
    //  onDismiss: (e: string) => {
    //    if (e === 'Clear')
    //      this.featureListService.updateOptionReleaseContractRules(this.selectedVersion?.id, rowData?.feature.id, rowData.id, factoryId, []).pipe(take(1)).subscribe();
    //  }
    //});
  }

  // Move category, feature or option
  moveItem(event: any): void {
    const props = ['category', 'feature', 'option'];
    const level = event.data.level;
    const id = level === 3 ? event.data.id : event.data[props[level - 1]].id;

    // Get min and max ranks (if after / before undefined => moved to bottom / top)
    const rankBefore = event.movedAfterSibling ? (level === 3 ? event.movedAfterSibling.rank : event.movedAfterSibling[props[level - 1]].rank) : this.lexicalRankService.getMinRank();
    const rankAfter = event.movedBeforeSibling ? (level === 3 ? event.movedBeforeSibling.rank : event.movedBeforeSibling[props[level - 1]].rank) : this.lexicalRankService.getMaxRank();

    // Get new rank from lexical rank service
    const newRank = this.lexicalRankService.getRankBetween(rankBefore, rankAfter);

    // Test if move within same parent
    const parentId = event.data.parent?.[props[level - 2]]?.id;
    const newParentId = event.newParentData?.[props[level - 2]]?.id;

    if (level === 1) {
      //this.categoryMoved(event.data.section.id, newRank);
    }
    else if (level === 2) {
      this.featureMoved.emit({ id, rank: newRank });
    } else {
      this.optionMoved.emit({ featureId: parentId, id, rank: newRank });
    }
  }

  // Open the feature import manager
  openFeatureImportManager(): void {
    this.featureImporterOpened.emit();
  }

  // Open the option import manager
  openOptionImportManager(destinationFeatureId: string): void {
    this.optionImporterOpened.emit(destinationFeatureId);
  }

  // Open the feature analyzer
  showFeatureAnalyzer(): void {
    this.featureAnalyzerOpened.emit();
  }
}
