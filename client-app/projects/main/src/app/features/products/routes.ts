import { Route } from "@angular/router";
import { ProductComponent } from "./product/product.component";
import { ProductsComponent } from "./products/products.component";
import { DimensionListResolverService } from "./route-resolvers/dimension-list-resolver.service";
import { FactoryListResolverService } from "./route-resolvers/factory-list-resolver.service";
import { MenuResolverService } from "./route-resolvers/menu-resolver.service";
import { ProductListResolverService } from "./route-resolvers/product-list-resolver.service";
import { ProductResolverService } from "./route-resolvers/product-resolver.service";
import { TestComponent } from "./test/test.component";

export const PRODUCTS_ROUTES: Route[] = [
  {
    path: '', resolve: { productList: ProductListResolverService, factoryList: FactoryListResolverService, dimensionList: DimensionListResolverService }, children: [
      { path: '', component: ProductsComponent },
      {
        path: ':id', component: ProductComponent, resolve: { product: ProductResolverService, menu: MenuResolverService }, children: [
          { path: 'features', loadChildren: () => import('./features/routes').then(mod => mod.PRODUCTFEATURELIST_ROUTES) },
          { path: 'rules', loadChildren: () => import('./rules/routes').then(mod => mod.PRODUCTRULELIST_ROUTES) },
          { path: 'settings', loadChildren: () => import('./settings/routes').then(mod => mod.PRODUCTSETTINGS_ROUTES) },
          { path: 'test', component: TestComponent },
          { path: '', redirectTo: 'test', pathMatch: 'full' }
        ]
      }
    ]
  }
];

