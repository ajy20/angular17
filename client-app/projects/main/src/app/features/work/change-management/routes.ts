import { Route } from "@angular/router";
import { ChangeRequestListComponent } from "./change-request-list/change-request-list.component";
import { ChangeRequestListResolverService } from "./route-resolvers/change-request-list-resolver.service";
import { WorkItemListResolverService } from "./route-resolvers/work-item-list-resolver.service";
import { WorkItemListComponent } from "./work-item-list/work-item-list.component";

export const CHANGE_MANAGEMENT_ROUTES: Route[] = [
  { path: 'change-request-list', component: ChangeRequestListComponent, resolve: { changeRequests: ChangeRequestListResolverService } },
  { path: 'work-item-list', component: WorkItemListComponent, resolve: { workItems: WorkItemListResolverService } },
  
  { path: '', redirectTo: 'change-request-list', pathMatch: 'full' }
];
