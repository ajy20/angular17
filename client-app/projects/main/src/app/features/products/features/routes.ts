import { Route } from "@angular/router";
import { ProductFeatureListComponent } from "./product-feature-list/product-feature-list.component";
import { FeatureListDocumentResolverService } from "./route-resolvers/feature-list-document-resolver.service";
import { FeatureListVersionResolverService } from "./route-resolvers/feature-list-version-resolver.service";
import { FactoriesResolverService } from "./route-resolvers/factories-resolver.service";
import { FeatureListRuleSetResolverService } from "./route-resolvers/feature-list-rule-set-resolver.service";

export const PRODUCTFEATURELIST_ROUTES: Route[] = [
  {
    path: '', resolve: { document: FeatureListDocumentResolverService }, children: [
      { path: 'versions/:versionId', component: ProductFeatureListComponent, resolve: { version: FeatureListVersionResolverService, factories: FactoriesResolverService, rules: FeatureListRuleSetResolverService } },
      { path: '', redirectTo: 'versions/default', pathMatch: 'full' }
    ]
  }
];

