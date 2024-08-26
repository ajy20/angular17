import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { VersionPageTemplateComponent } from '../../shared/components/version-page-template/version-page-template.component';
import { Dimension } from '../../shared/models/dimensions/dimension.model';
import { ProductFeatureListTableFactory } from '../shared/product-feature-list-table/model/product-feature-list-table-factory.model';
import { ProductFeatureListTableFeature } from '../shared/product-feature-list-table/model/product-feature-list-table-feature.model';
import { ProductFeatureListTableStyle } from '../shared/product-feature-list-table/model/product-feature-list-table-style.model';
import { ProductFeatureListTableComponent } from '../shared/product-feature-list-table/product-feature-list-table.component';
import { FeatureListVersion } from '../shared/models/feature-list-version.model';
import { FeatureListVersionComparison } from '../../shared/components/feature-comparer/models/feature-list-version-comparison.model';
import { DataTableSettings } from '../../../../shared/data-table/model/data-table-settings.model';
import { Product } from '../../shared/models/product/product.model';
import { ProductStyle } from '../../shared/models/product/product-style.model';
import { BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { BaseDocument } from '../../shared/components/version-page-template/models/document.model';
import { FeatureListService } from '../shared/feature-list.service';
import { FactoryService } from '../../shared/factory.service';
import { DimensionService } from '../../shared/dimension.service';
import { DynamicFormService } from '../../../../shared/dynamic-form/services/dynamic-form.service';
import { LexicalRankService } from '../../../../shared/lexical-rank/lexical-rank.service';
import { ProductService } from '../../shared/product.service';
import { TicketService } from '../../shared/ticket.service';
import { DataTableColumnDefinition } from '../../../../shared/data-table/model/data-table-column-definition.model';
import { Factory } from '../../shared/models/factory/factory.model';
import { FeatureFactoryList } from '../shared/models/feature-factory-list.model';

@Component({
  selector: 'csps-product-feature-list',
  standalone: true,
  imports: [ProductFeatureListTableComponent, VersionPageTemplateComponent, NgbTooltipModule],
  templateUrl: './product-feature-list.component.html',
  styleUrl: './product-feature-list.component.scss'
})
export class ProductFeatureListComponent implements OnInit, OnDestroy {
  @ViewChild(VersionPageTemplateComponent) kernel!: VersionPageTemplateComponent<FeatureListVersion, FeatureListVersionComparison>;

  // The datatable settings
  settings!: DataTableSettings<ProductFeatureListTableFeature>;

  // The selected product
  product!: Product;

  // The list of dimensions
  dimensions: Dimension[] = [];

  // The list of product styles
  styles: ProductStyle[] = [];

  // The selected feature list document
  selectedDocument!: BaseDocument;

  // The selected feature list version
  selectedVersion!: FeatureListVersion;

  features: ProductFeatureListTableFeature[] = [];

  // Indicates that anomalies are being cleared
  anomalyClearingMode: boolean = false;

  // The list of factories for the feature
  featureFactories: ProductFeatureListTableFactory[] = [];

  // A fast-searchable object to locate options
  optionLookup!: { [key: string]: any };

  // The rules
  rules: any[] = [];

  // The name of the auto generated features
  AUTOGEN_CATEGORY: string = "AUTO GENERATED";
  AUTOGEN_FEATURE_LOC: [string, string] = ["LOC", "Manufacturing Location"];
  AUTOGEN_FEATURE_STYLE: [string, string] = ["STYLE", "Style"];
  AUTOGEN_FEATURE_MODLEVEL: [string, string] = ["MODLEVEL", "Mod Level"];
  AUTOGEN_FEATURE_QTY: [string, string] = ["QTY", "Unit Quantity"];
  AUTOGEN_FEATURE_TAG: [string, string] = ["TAG", "Unit Tag"];
  AUTOGEN_FEATURE_SPECL: [string, string] = ["SPECL", "Special Flag"];

  // The selected style filter
  styleFilter$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  // Used for cleaning subscription 
  private unsubscribe: Subject<void> = new Subject();

  constructor(
    public featureListService: FeatureListService,
    private factoryService: FactoryService,
    private dimensionService: DimensionService,
    private dynamicFormService: DynamicFormService,
    private lexicalRankService: LexicalRankService,
    private productService: ProductService,
    // private jsonService: JsonService,
    // private excelService: ExcelService,
    private ticketService: TicketService,
    // private exportConfiguratorService: ExportConfiguratorService
  ) { }

  ngOnInit(): void {
    // Subscribe to feature list document and feature list version
    const observables = [
      this.featureListService.document$.pipe(takeUntil(this.unsubscribe)),
      this.featureListService.version$.pipe(takeUntil(this.unsubscribe)),
      this.productService.product$.pipe(takeUntil(this.unsubscribe)),
      this.factoryService.factories$.pipe(takeUntil(this.unsubscribe)),
      this.featureListService.factoryList$.pipe(takeUntil(this.unsubscribe)),
      this.dimensionService.dimensions$.pipe(takeUntil(this.unsubscribe)),
      this.styleFilter$.pipe(takeUntil(this.unsubscribe)),
      this.featureListService.ruleSet$.pipe(takeUntil(this.unsubscribe)),
    ];

    combineLatest(...observables).pipe(takeUntil(this.unsubscribe)).subscribe(([document, version, product, factories, factoryList, dimensions, styleIdFilter, ruleSet]) => {
      this.selectedDocument = document as any;
      this.selectedVersion = version as any;
      this.product = product as any;
      this.styles = this.product.styles || [];
      

      // // Store rules
      // this.rules = ruleSet?.rules || [];

      if (version && factoryList && factories && dimensions) {

        this.features = this.selectedVersion.features;
        this.featureFactories = (factories as Factory[]).filter(x => (factoryList as FeatureFactoryList).finalAssemblyFactoryIds.includes(x.id));
        this.dimensions = dimensions as Dimension[];


        // // Create temporary objects for fast feature and option lookups
        // this.optionLookup = this.selectedVersion.features.reduce((acc: any, f) => {
        //   f.options.forEach(o => {
        //     acc[o.id] = { ...o, feature: f };
        //   });
        //   return acc;
        // }, {});

        // // Flatten the list of options and add dummy options for each unused feature
        // const options = this.selectedVersion.features
        //   .filter(f => !f.styleRestrictions || !f.styleRestrictions.length || !styleIdFilter || f.styleRestrictions.includes(styleIdFilter))
        //   .sort(this.lexicalRankService.lexicalRankSorter())
        //   .reduce((acc, f) => {
        //     const featureMetaData = {
        //       addIcon: f.isNumeric || f.isFreeText || f.isAutoGenerated ? null : faPlus,
        //       editIcon: f.isAutoGenerated ? null : faEdit,
        //       deleteIcon: f.isAutoGenerated ? null : faTrash,
        //       warning:
        //         !this.featureFactories.every(factory => f.options.some(o => o.releases.some(r => r.factoryId === factory.id))) ||
        //           (f.isArray && f.arraySize.featureId === this.emptyGuid && f.arraySize.size === 0) ||
        //           f.options.some(o => o.releases.some(r => r.asSQ && !r.sqRules?.rules?.length && !r.unavailableRules?.rules?.length && !r.contractRules?.rules?.length)) ?
        //           faExclamationCircle : '',
        //       fullName: `${f.name} - ${f.description} ${f.isArray ? (' (Array Feature' + (f.arraySize.featureId !== this.emptyGuid && f.arraySize?.featureId?.length > 0 ? ' - size constrained by ' + this.selectedVersion.features.find(g => g.id === f.arraySize.featureId)?.name : '') + (f.arraySize.size > 0 ? ' - ' + f.arraySize.size + ' elements max' : '')) + ')' : ''}`,
        //       dimension: this.dimensions.find(d => d.id === f.dimensionId),
        //       typeIcon: f.isNumeric ? faBalanceScale : (f.isFreeText ? faEdit : faList),
        //       restrictionIcon: f.styleRestrictions?.length ? faEye : null,
        //       restrictedStyles: this.styles.filter(s => f.styleRestrictions?.includes(s.id)).map(s => s.name).join(', '),
        //       noteIcon: faStickyNote
        //     };
        //     if (!f.options?.length)
        //       acc.push({ isPlaceholder: true, feature: { ...f, ...featureMetaData } });
        //     else {
        //       const { options, ...cleanedFeature } = f;
        //       const opts = f.options.sort(this.lexicalRankService.lexicalRankSorter()).map(o => ({ ...o, feature: { ...cleanedFeature, ...featureMetaData } }));
        //       acc.push(...opts);
        //     }
        //     return acc;
        //   }, new Array());


        // //// Detect anomalies
        // // if (!this.anomalyClearingMode && !this.selectedVersion.released)
        // //   this.anomalyClearingMode = this.detectAnomalies();

        
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  
  // features: ProductFeatureListTableFeature[] = [
  //   {
  //     id: '1',
  //     category: { name: 'Cat. A' },
  //     name: 'Feat 1',
  //     description: 'Desc. F1',
  //     rank: 'fds',
  //     dimensionId: undefined,
  //     isNumeric: false,
  //     isFreeText: false,
  //     options: [
  //       { id: '11', name: 'option11', rank: 'aaa', description: 'desc11', isActive: true, releases: [], isAutoGenerated: false },
  //       { id: '12', name: 'option12', rank: 'bbb', description: 'desc12', isActive: true, releases: [], isAutoGenerated: false }
  //     ],
  //     styleRestrictions: [],
  //     notes: 'ABC',
  //     isArray: false,
  //     arraySize: undefined,
  //     isAutoGenerated: false
  //   }
  // ];

  // dimensions: Dimension[] = [];

  // factories: ProductFeatureListTableFactory[] = [
  //   { id: '1', name: 'San Antonio', abbreviation: 'SAT' },
  //   { id: '2', name: 'Nantes', abbreviation: 'NAN' },
  //   { id: '3', name: 'Wuxi', abbreviation: 'WXF' }
  // ];

  // styles: ProductFeatureListTableStyle[] = [
  //   { id: '1', name: 'A' },
  //   { id: '2', name: 'B' },
  // ]
}
