import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, expand, map, Observable, reduce, takeWhile, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { memoize } from '../../../../shared/memoize/memoize.decorator';
import { ChangeRequest } from './models/change-request.model';
import { WorkItem } from './models/work-item.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Basic Y3NlaWduYzpKY2lmcmFuY2VAMjAyMyE=' })
};


export interface OData<T> {
  value: T[];
  '@odata.nextLink'?: string,
}


@Injectable({
  providedIn: 'root'
})
export class PLMService {
  // Resource url
  private plmChangeManagementUrl = environment.basePLMUrl + 'ChangeMgmt';
  private plmWorkflowManagementUrl = environment.basePLMUrl + 'Workflow';

  // The list of change requests
  changeRequests$: BehaviorSubject<ChangeRequest[]> = new BehaviorSubject<ChangeRequest[]>([]);

  // The list of work items
  workItems$: BehaviorSubject<WorkItem[]> = new BehaviorSubject<WorkItem[]>([]);

  constructor(private http: HttpClient) { }

  private fetch<T>(url: string): Observable<OData<T>> {
    return this.http.get<OData<T>>(url, httpOptions)
  }





  // Get the list of change requests

  // http://<Windchill_Host>/Windchill/servlet/odata/ChangeMgmt/ChangeRequests

  getChangeRequests(): Observable<ChangeRequest[]> {

    const contexts = [
      'MFG-Reynosa',
      'MFG-Juarez',
      //'Valves and Actuators - Controls',
      //'Controllers - SMZ - JCH',
      //'Unit - SMZ - JCH'
    ];

    const predicate = contexts.map(c => `Context/Name eq '${c}'`).join(' or ');

    const url = `${this.plmChangeManagementUrl}/ChangeRequests?$count=true&$select=Name,Number,ID,State,CreatedOn&$filter=State/Value ne 'RESOLVED' and (${predicate})&$expand=Context,ProcessObjects($filter=(contains(ID,'WTChangeOrder2'));$select=Number,Name,ID)`


    return this.fetch<ChangeRequest>(url).pipe(
      expand(response => this.fetch<ChangeRequest>(response['@odata.nextLink'] || '')),
      takeWhile(response => !!response['@odata.nextLink'], true),
      reduce((all, response) => all.concat(response.value), [] as ChangeRequest[]),
      tap(changeRequests => { console.log(changeRequests); this.changeRequests$.next(changeRequests); })
    )
  }


  getWorkItems(): Observable<WorkItem[]> {
    const url = `${this.plmWorkflowManagementUrl}/WorkItems?$count=true&$expand=Subject,Activity,Owner,CompletedBy`


    return this.fetch<WorkItem>(url).pipe(
      expand(response => this.fetch<WorkItem>(response['@odata.nextLink'] || '')),
      takeWhile(response => !!response['@odata.nextLink'], true),
      reduce((all, response) => all.concat(response.value), [] as WorkItem[]),
      tap(workItems => { console.log(workItems); this.workItems$.next(workItems); })
    )
  }


  openChangeRequestInPLM(changeRequest: ChangeRequest): void {

    const link = `https://plm-train.johnsoncontrols.com/Windchill/app/#ptc1/tcomp/infoPage?ContainerOid=${changeRequest.Context.ID}&oid=${changeRequest.ID}&u8=1`;
    window.open(link, "_blank");
  }
}
