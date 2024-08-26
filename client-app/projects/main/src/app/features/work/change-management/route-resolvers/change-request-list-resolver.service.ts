import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, mergeMap, Observable, of, take } from 'rxjs';
import { ChangeRequest } from '../shared/models/change-request.model';
import { PLMService } from '../shared/plm.service';
 
@Injectable({
  providedIn: 'root'
})
export class ChangeRequestListResolverService implements Resolve<ChangeRequest[]> {

  constructor(private plmService: PLMService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ChangeRequest[]>   {
 
    return this.plmService.getChangeRequests().pipe(
      take(1),
      mergeMap(changeRequests => {
        if (changeRequests) {
          return of(changeRequests);
        } else {
          this.router.navigate(['/home']);
          return EMPTY;
        }
      })
    );
  }
}

