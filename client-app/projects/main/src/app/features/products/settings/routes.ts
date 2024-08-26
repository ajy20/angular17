import { Route } from "@angular/router";
import { DocumentsComponent } from "./documents/documents.component";
import { OverviewComponent } from "./overview/overview.component";
import { RolesComponent } from "./roles/roles.component";
import { SettingsComponent } from "./settings/settings.component";
import { TicketsComponent } from "./tickets/tickets.component";

export const PRODUCTSETTINGS_ROUTES: Route[] = [
  {
    path: '', component: SettingsComponent, children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'documents', component: DocumentsComponent, resolve: { /*documentList: ProductDocumentListResolverService*/ } },
      { path: 'roles', component: RolesComponent, resolve: { /*roleDefinition: ProductRoleDefinitionResolverService, groupList: UserGroupListResolverService, factories: FactoriesResolverService, versions: ManufacturingFootprintVersionsResolverService*/ } },
      { path: 'tickets', component: TicketsComponent, resolve: { /*ticketList: TicketListResolverService*/ } },
      //  {
      //    path: 'manufacturing', resolve: { document: ManufacturingFootprintDocumentResolverService }, children: [
      //      { path: 'versions/:versionId', component: ManufacturingFootprintComponent, resolve: { version: ManufacturingFootprintVersionResolverService } },
      //      { path: '', redirectTo: 'versions/default' }
      //    ]
      //  },
    ]
  }
];
