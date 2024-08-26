import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { faCalculator, faClock, faCog, faCogs, faDesktop, faDollarSign, faFile, faHome, faLanguage, faUsersCog, faWeightHanging } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageTemplateComponent } from '../../../shared/page-template/page-template.component';
import { PageWrapperComponent } from '../../../shared/page-wrapper/page-wrapper.component';
import { MenuItem } from '../../../shared/side-bar/model/menu-item.model';
import { QuickLink } from '../../../shared/side-bar/model/quick-link.model';
import { ProductMenuItem } from '../shared/models/menu/product-menu-item.model';
import { Product } from '../shared/models/product/product.model';
import { ProductMenuService } from '../shared/product-menu.service';
import { ProductService } from '../shared/product.service';

@Component({
  selector: 'csps-product',
  standalone: true,
  imports: [CommonModule, PageWrapperComponent, PageTemplateComponent, RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, OnDestroy {
  // The menu items, quickLinks
  menuItems!: MenuItem[];
  quickLinks!: QuickLink[];
  menuHeader: string = '';

  // The selected product
  product!: Product;

  // Used for cleaning subscription 
  private unsubscribe: Subject<void> = new Subject();

  constructor(private productMenuService: ProductMenuService, private productService: ProductService) { }

  ngOnInit(): void {
    const observables: [Observable<Product | null>, Observable<{ [key: string]: ProductMenuItem[] } | null>] = [
      this.productService.product$.pipe(takeUntil(this.unsubscribe)),
      this.productMenuService.productMenuItems$.pipe(takeUntil(this.unsubscribe))
    ];

    combineLatest(observables).pipe(takeUntil(this.unsubscribe)).subscribe(([product, menuItems]: [Product | null, { [key: string]: ProductMenuItem[] } | null]) => {
      if (product && menuItems) {
        this.product = product;
        this.menuHeader = this.product.name;
        this.quickLinks = []; // this.productMenuService.quickLinks;


        const items : MenuItem[] = [
          {
            id: '1', label: 'Product Features', icon: faHome, children: [
              ...(menuItems['productFeatureList']?.map((x, i) => ({ id: '101' + (i + 1), label: x.name, icon: faHome, route: ['features'] })) || []),
              ...(menuItems['featureLimitsList']?.map((x, i) => ({ id: '102' + (i + 1), label: x.name, icon: faHome, route: ['feature-limits'] })) || []),
              ...(menuItems['productRuleSet']?.map((x, i) => ({ id: '103' + (i + 1), label: x.name, icon: faHome, route: ['rules'] })) || []),
              ...(menuItems['attributes']?.map((x, i) => ({ id: '104' + (i + 1), label: x.name, icon: faHome, route: ['attributes'] })) || []),
              {
                id: '105', label: 'PIN', icon: faHome, children: [
                  ...(menuItems['pinDefinitions']?.map((x, i) => ({ id: '105' + (i + 1), label: x.name, icon: faHome, route: ['pin-definitions', ...x.routeArgs] })) || []),
                ]
              }
            ]
          },
          {
            id: '2', label: 'Eoms', icon: faFile, children: [
              ...(menuItems['eoms']?.map((x, i) => ({ id: '2' + (i + 1), label: x.name, icon: faFile, route: ['eoms', ...x.routeArgs] })) || []),
            ]
          },
          {
            id: '5', label: 'Lead Time', icon: faClock, children: [
              ...(menuItems['leadTimeBooks']?.map((x, i) => ({ id: '5' + (i + 1), label: x.name, icon: faFile, route: ['lead-time', ...x.routeArgs] })) || [])
            ]
          },
          {
            id: '6', label: 'Pricing', icon: faDollarSign, children: [
              ...(menuItems['priceBooks']?.map((x, i) => ({ id: '6' + (i + 1), label: x.name, icon: faFile, route: ['pricing', ...x.routeArgs] })) || [])
            ]
          },
          {
            id: '7', label: 'Sel. Nav', icon: faHome, children: [
              {
                id: '71', label: 'Screen builders', icon: faDesktop, children: [
                  ...(menuItems['batchScreen']?.map((x, i) => ({ id: '711' + (i + 1), label: x.name, icon: faHome, route: ['sel-nav', 'screen-builder', 'batch-screens'] })) || []),
                  ...(menuItems['unitScreen']?.map((x, i) => ({ id: '712' + (i + 1), label: x.name, icon: faHome, route: ['sel-nav', 'screen-builder', 'unit-screens'] })) || []),
                  ...(menuItems['configureScreen']?.map((x, i) => ({ id: '713' + (i + 1), label: x.name, icon: faHome, route: ['sel-nav', 'screen-builder', 'configure-screens'] })) || []),
                ]
              },
              {
                id: '72', label: 'CRS Mapping Files', icon: faCalculator, children: [
                  ...(menuItems['crsMappingBatchInput']?.map((x, i) => ({ id: '721' + (i + 1), label: x.name, icon: faHome, route: ['sel-nav', 'crs-mapping', 'batch-input'] })) || []),
                  ...(menuItems['crsMappingBatchOutput']?.map((x, i) => ({ id: '722' + (i + 1), label: x.name, icon: faHome, route: ['sel-nav', 'crs-mapping', 'batch-output'] })) || []),
                  ...(menuItems['crsMappingUnitInput']?.map((x, i) => ({ id: '723' + (i + 1), label: x.name, icon: faHome, route: ['sel-nav', 'crs-mapping', 'unit-input'] })) || []),
                  ...(menuItems['crsMappingUnitOutput']?.map((x, i) => ({ id: '724' + (i + 1), label: x.name, icon: faHome, route: ['sel-nav', 'crs-mapping', 'unit-output'] })) || []),
                ]
              },
              ...(menuItems['flexGroupDefinitionScreen']?.map((x, i) => ({ id: '74' + (i + 1), label: x.name, icon: faUsersCog, route: ['sel-nav', 'flex-groups'] })) || []),
              ...(menuItems['defaultValues']?.map((x, i) => ({ id: '75' + (i + 1), label: x.name, icon: faUsersCog, route: ['sel-nav', 'default-values'] })) || []),
              ...(menuItems['optionExclusions']?.map((x, i) => ({ id: '76' + (i + 1), label: x.name, icon: faUsersCog, route: ['sel-nav', 'option-exclusions'] })) || []),
              ...(menuItems['brandingMask']?.map((x, i) => ({ id: '77' + (i + 1), label: x.name, icon: faUsersCog, route: ['sel-nav', 'branding-masks'] })) || []),
              ...(menuItems['featureConcatenations']?.map((x, i) => ({ id: '78' + (i + 1), label: x.name, icon: faUsersCog, route: ['sel-nav', 'feature-concatenations'] })) || []),
              ...(menuItems['erpString']?.map((x, i) => ({ id: '781' + (i + 1), label: x.name, icon: faUsersCog, route: ['sel-nav', 'erp-strings'] })) || []),
              ...(menuItems['onScreenAssistance']?.map((x, i) => ({ id: '79' + (i + 1), label: x.name, icon: faUsersCog, route: ['sel-nav', 'on-screen-assistance'] })) || []),
              {
                id: '79', label: 'Emulator', icon: faUsersCog, children: [
                  ...(menuItems['batchScreen']?.map((x, i) => ({ id: '791' + (i + 1), label: 'Batch', icon: faHome, route: ['sel-nav', 'emulator', 'batch'] })) || []),
                  ...(menuItems['unitScreen']?.map((x, i) => ({ id: '792' + (i + 1), label: 'Unit', icon: faHome, route: ['sel-nav', 'emulator', 'unit'] })) || []),
                ]
              },
            ]
          },
          {
            id: '8', label: 'Code Calculations', icon: faCogs, children: [
              ...(menuItems['codeCalculations']?.map((x, i) => ({ id: '801' + (i + 1), label: x.name, icon: faFile, route: ['code-calculations'] })) || []),
            ]
          },
          {
            id: '10', label: 'Weights', icon: faWeightHanging, children: [
              ...(menuItems['weightBooks']?.map((x, i) => ({ id: '1001' + (i + 1), label: x.name, icon: faHome, route: ['weighting'] })) || [])
            ]
          },
          {
            id: '11', label: 'Translations', icon: faLanguage, children: [
              ...(menuItems['translations']?.map((x, i) => ({ id: '1101' + (i + 1), label: x.name, icon: faHome, route: ['translations'] })) || []),
            ]
          },
          ...(menuItems['productMenuSettings']?.map((x, i) => ({ id: '12' + (i + 1), label: x.name, icon: faCog, route: ['settings'], stickyBottom: true, collpaseOnClick: true })) || []),
        ];

        // Filter menu item without children & without route
        this.menuItems = items.reduce((acc, top) => {
          top.children = top.children?.filter(child => child.route || child.children?.length);
          if (top.children?.length || top.route)
            acc.push(top); return acc;
        }, new Array());
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
