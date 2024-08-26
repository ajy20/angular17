import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, mergeMap, Observable, of, take } from 'rxjs';
import { WorkItem } from '../shared/models/work-item.model';
import { PLMService } from '../shared/plm.service';
 
@Injectable({
  providedIn: 'root'
})
export class WorkItemListResolverService implements Resolve<WorkItem[]> {

  constructor(private plmService: PLMService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WorkItem[]>   {
 
    return this.plmService.getWorkItems().pipe(
      take(1),
      mergeMap(workItems => {
        if (workItems) {
          return of(workItems);
        } else {
          this.router.navigate(['/home']);
          return EMPTY;
        }
      })
    );
  }
}

