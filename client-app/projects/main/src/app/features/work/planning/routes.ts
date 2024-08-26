import { Route } from "@angular/router";
import { BacklogComponent } from "./backlog/backlog.component";
import { CapacityComponent } from "./capacity/capacity.component";
import { CommitmentComponent } from "./commitment/commitment.component";
import { EffortsComponent } from "./efforts/efforts.component";
import { PrioritiesComponent } from "./priorities/priorities.component";
import { RetrospectiveComponent } from "./retrospective/retrospective.component";
import { ScenariosComponent } from "./scenarios/scenarios.component";
import { SkeletonComponent } from "./skeleton/skeleton.component";
import { StatsComponent } from "./stats/stats.component";

export const PLANNING_ROUTES: Route[] = [
  {
    path: '', component: SkeletonComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ }, children: [
      { path: 'backlog', component: BacklogComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'priorities', component: PrioritiesComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'efforts', component: EffortsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'scenarios', component: ScenariosComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'capacity', component: CapacityComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'commitment', component: CommitmentComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'retrospective', component: RetrospectiveComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: 'stats', component: StatsComponent, resolve: { /*changeRequests: ChangeRequestListResolverService*/ } },
      { path: '', redirectTo: 'backlog', pathMatch: 'full' }
    ]
  }
];
