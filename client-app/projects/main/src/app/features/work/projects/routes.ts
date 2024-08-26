import { Route } from "@angular/router";
import { ProjectBudgetComponent } from "./project-budget/project-budget.component";
import { ProjectListComponent } from "./project-list/project-list.component";
import { ProjectPreviewComponent } from "./project-preview/project-preview.component";
import { ProjectComponent } from "./project/project.component";
import { ProjetDesignComponent } from "./projet-design/projet-design.component";
 
export const PROJECTS_ROUTES: Route[] = [
  //{
  //  path: '', component: SkeletonComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ }, children: [
  //    //{ path: 'backlog', component: BacklogComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    //{ path: 'priorities', component: PrioritiesComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    //{ path: 'efforts', component: EffortsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    //{ path: 'scenarios', component: ScenariosComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    //{ path: 'capacity', component: CapacityComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    //{ path: 'commitment', component: CommitmentComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    //{ path: 'retrospective', component: RetrospectiveComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    //{ path: 'stats', component: StatsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
  //    { path: '', redirectTo: 'backlog', pathMatch: 'full' }
  //  ]
  //}

  { path: 'project-list', component: ProjectListComponent },
  {
    path: 'projects/:id', component: ProjectComponent, children: [
      { path: 'preview', component: ProjectPreviewComponent },
      { path: 'budget', component: ProjectBudgetComponent },
      { path: 'design', component: ProjetDesignComponent },
      { path: '', redirectTo: 'preview', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: 'project-list', pathMatch: 'full' }
];
