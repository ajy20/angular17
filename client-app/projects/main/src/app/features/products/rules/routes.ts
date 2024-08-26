import { Route } from "@angular/router";
import { ProductRuleListComponent } from "./product-rule-list/product-rule-list.component";

export const PRODUCTRULELIST_ROUTES: Route[] = [
  {
    path: '', resolve: { /*document: FeatureListDocumentResolverService*/ }, children: [
      { path: 'versions/:versionId', component: ProductRuleListComponent, resolve: { /*version: FeatureListVersionResolverService, factories: FactoriesResolverService, rules: FeatureListRuleSetResolverService*/ } },//
      { path: '', redirectTo: 'versions/default', pathMatch: 'full' }
    ]
  }
];
