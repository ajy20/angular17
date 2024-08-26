import { Route } from "@angular/router";
import { AreasComponent } from "./areas/areas.component";
import { AssignmentMatrixComponent } from "./assignment-matrix/assignment-matrix.component";
import { BusinessUnitsComponent } from "./business-units/business-units.component";
import { CurrenciesComponent } from "./currencies/currencies.component";
import { DimensionsComponent } from "./dimensions/dimensions.component";
import { ExportGroupsComponent } from "./export-groups/export-groups.component";
import { FactoriesComponent } from "./factories/factories.component";
import { GroupsComponent } from "./groups/groups.component";
import { PermissionsComponent } from "./permissions/permissions.component";
import { PriceReportsComponent } from "./price-reports/price-reports.component";
import { ProductsComponent } from "./products/products.component";
import { RolesComponent } from "./roles/roles.component";
import { SiteMapComponent } from "./site-map/site-map.component";
import { SkeletonComponent } from "./skeleton/skeleton.component";
import { SrTypesComponent } from "./sr-types/sr-types.component";
import { UploadRegionsComponent } from "./upload-regions/upload-regions.component";
import { UserTypesComponent } from "./user-types/user-types.component";
 
export const ADMIN_ROUTES: Route[] = [
  {
    path: '', component: SkeletonComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ }, children: [
      { path: 'products', component: ProductsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'factories', component: FactoriesComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'dimensions', component: DimensionsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'currencies', component: CurrenciesComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },

      { path: 'groups', component: GroupsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'roles', component: RolesComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'permissions', component: PermissionsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      //{ path: 'proxies', component: AssignmentMatrixComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'assignments', component: AssignmentMatrixComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },

      { path: 'business-units', component: BusinessUnitsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'areas', component: AreasComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'user-types', component: UserTypesComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'export-groups', component: ExportGroupsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'upload-regions', component: UploadRegionsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'price-reports', component: PriceReportsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'sr-types', component: SrTypesComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },

      { path: 'site-map', component: SiteMapComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
     ]
  }
];
