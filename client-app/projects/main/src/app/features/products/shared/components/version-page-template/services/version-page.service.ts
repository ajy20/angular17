import { Inject, Injectable, Optional } from '@angular/core';
import { BaseVersion } from '../models/base-version.model';
import { BaseVersionComparison } from '../models/version-comparison.model';
import { BehaviorSubject, catchError, filter, interval, map, mergeMap, Observable, of, retry, Subject, switchMap, take, takeWhile, tap, throwError } from 'rxjs';
import { BaseDocument } from '../models/document.model';
import { BaseVersionLite } from '../models/version-lite.model';
import { environment } from '../../../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseVersionChangeHistory } from '../models/version-change-history.model';
import helpInfoKeys from '../../../../settings/help/helpInfoKeys';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export abstract class VersionPageService<TVersion extends BaseVersion, TVersionComparison extends BaseVersionComparison> {

  // Lite observable for presenting informations about all version (exclude FeatureOptions)
  document$: BehaviorSubject<BaseDocument | null> = new BehaviorSubject<BaseDocument | null>(null);;

  // Selected Feature List Version
  version$: BehaviorSubject<TVersion | null> = new BehaviorSubject<TVersion | null>(null);

  // List of all the version available for the document
  versions$: BehaviorSubject<TVersion[] | []> = new BehaviorSubject<TVersion[] | []>([]);

  // Selected Feature List Version Comparison
  versionComparison$: BehaviorSubject<TVersionComparison | null> = new BehaviorSubject<TVersionComparison | null>(null);

  // Emits whenever a new document is created
  documentCreated$: Subject<BaseDocument> = new Subject<BaseDocument>();

  // Emits whenever a document is renamed
  documentRenamed$: Subject<{ id: string, name: string }> = new Subject<{ id: string, name: string }>();

  // Emits whenever a version is renamed
  versionRenamed$: Subject<{ documentId: string, id: string, label: string }> = new Subject<{ documentId: string, id: string, label: string }>();

  // Emits whenever a document reference is updated
  documentReferenceUpdated$: Subject<{ id: string, reference: string }> = new Subject<{ id: string, reference: string }>();

  // Document selected for import
  importableDocument$: BehaviorSubject<BaseDocument | null> = new BehaviorSubject<BaseDocument | null>(null);

  // List of versions for import
  importableVersions$: BehaviorSubject<BaseVersionLite[] | null> = new BehaviorSubject<BaseVersionLite[] | null>(null);

  // Version selected for import
  importableVersion$: BehaviorSubject<TVersion | null> = new BehaviorSubject<TVersion | null>(null);

  // Document versions endpoint
  protected versionUrl = environment.baseUrl;
  protected documentUrl = environment.baseUrl;

  // Indicate that a version is in the process of being created
  creatingVersion$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Indicate that a anomaly cleanup process is running
  cleanningAnomalies$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // The local storage key for navigation data
  NAVIGATION_MODE_DATA = 'NAVIGATIONMODEDATA';

  constructor(
    protected http: HttpClient,
    @Optional() @Inject({}) type: string) {
    this.versionUrl += type + '-versions';
    this.documentUrl += type + '-documents';
  }

  // Get the document by  id
  // Using protected to force the derived class to implement a non generic function
  // So that the consumer of the service do not need to worry about the type implementation
  protected getDocumentById<T extends BaseDocument>(documentId: string): Observable<T | null> {
    const url = `${this.documentUrl}/${documentId}`;
    return this.http.get<T>(url).pipe(tap(x => {
      this.document$.next(x);
    }));
  }

  // Get the document by product id
  // Using protected to force the derived class to implement a non generic function
  // So that the consumer of the service do not need to worry about the type implementation
  protected getDocumentByProductId<T extends BaseDocument>(productId: string): Observable<T | null> {
    const url = `${this.documentUrl}?productId=${productId}`;
    return this.http.get<T>(url).pipe(tap(x => {
      this.document$.next(x);
    }));
  }

  // Get the document by product id and name
  // Using protected to force the derived class to implement a non generic function
  // So that the consumer of the service do not need to worry about the type implementation
  protected getDocumentByProductIdAndName<T extends BaseDocument>(productId: string, name: string): Observable<T | null> {
    const url = `${this.documentUrl}?productId=${productId}&name=${name}`;
    return this.http.get<T>(url).pipe(tap(x => {
      this.document$.next(x);
    }));
  }

  // Get the version by id
  // Using protected to force the derived class to implement a non generic function
  // So that the consumer of the service do not need to worry about the type implementation
  protected getVersion(id: string): Observable<TVersion | null> {
    // Compute the version Id
    const computedId = this.computeVersionId(id);

    if (!computedId)
      return of(null).pipe(tap(x => { this.version$.next(null); }));

    const url = `${this.versionUrl}/${computedId}`;
    return this.http.get<TVersion>(url).pipe(tap(x => {
      this.version$.next(x);
    }));
  }

  // Get all versions by product id
  getAllVersions(productId: string): Observable<TVersion[] | []> {
    const url = `${this.versionUrl}/active-and-released-versions?productId=${productId}`;
    return this.http.get<TVersion[]>(url).pipe(tap(x => {
      this.versions$.next(x);
    }));
  }

  // Get the importable version by id
  // Using protected to force the derived class to implement a non generic function
  // So that the consumer of the service do not need to worry about the type implementation
  protected getImportableVersion(id: string): Observable<TVersion | null> {
    // Compute the version Id
    const computedId = this.computeVersionId(id);

    if (!computedId)
      return of(null).pipe(tap(x => { this.importableVersion$.next(null); }));

    const url = `${this.versionUrl}/${computedId}`;
    return this.http.get<TVersion>(url).pipe(tap(x => {
      this.importableVersion$.next(x);
    }));
  }

  // FB : protected ?
  compareVersions(versionId1: string, versionId2: string): Observable<TVersionComparison | null> {
    const url = `${this.versionUrl}/${versionId1}/compare-to-version?versionId=${versionId2}`;
    return this.http.get<TVersionComparison>(url, httpOptions).pipe(tap(x => {
      this.versionComparison$.next(x);
    }));
  }

  //compareVersionToLatest(versionId: string): Observable<TVersionComparison | null> {
  //  const url = `${this.versionUrl}/${versionId}/compare-to-latest`;
  //  return this.http.get<TVersionComparison>(url, httpOptions).pipe(tap(x => {
  //    this.versionComparison$.next(x);
  //  }));
  //}

  getVersionChangeHistory(id: string): Observable<BaseVersionChangeHistory> {
    const url = `${this.versionUrl}/${id}/change-history`;
    return this.http.get<BaseVersionChangeHistory>(url);
  }

  // // Retrieve the workflow for the selected version
  // getVersionWorkflow(id: string): Observable<any> {
  //   const url = `${this.versionUrl}/${id}/workflow`;
  //   return this.http.get<VersionWorkflow>(url);
  // }

  // // Activate workflow transition, validate transition is successful and update version statuses
  // activateTransition(id: string, transitionId: string, workflowVariants: { id: string, stepId: string }[], steps: WorkflowStep[], variantId?: string): Observable<any> {
  //   const url = `${this.versionUrl}/${id}/workflow/transition`;
  //   const payload = variantId?.length ? { transitionId, variantId } : { transitionId };

  //   let variants = workflowVariants;
  //   return this.http.post(url, payload, httpOptions).pipe(
  //     // Get Version workflow
  //     mergeMap((value) => this.getVersionWorkflow(id).pipe(
  //       tap(x => {
  //         variants = x.variants;
  //       }),
  //       // Validate pre transition workflow variants with latest workflow variants. If same then repeat get request after every 3 seconds delay
  //       repeatWhen((notifications) => notifications.pipe(
  //         takeWhile(() => JSON.stringify(workflowVariants) === JSON.stringify(variants))
  //       )
  //       ),
  //       timeout(60000),
  //       delay(3000),
  //       finalize(() => {
  //         const version = this.version$.getValue();
  //         // Based on latest variants after transition, compute new statuses for version
  //         const newVersionStatuses = this.getNewVersionStatuses(variants, steps);
  //         if (version) {
  //           newVersionStatuses.forEach(variantStatus => {
  //             version.statuses[variantStatus.id] = variantStatus.status;
  //           });

  //           this.version$.next(version);
  //         }
  //       })
  //     ))
  //   );
  // }

  resetWorkflow(id: string): Observable<any> {
    const url = `${this.versionUrl}/${id}/reset-workflow`;
    const payload = { };
    return this.http.post(url, payload, httpOptions);
  }

  // // Get new version statuses based on transition to set into version
  // getNewVersionStatuses(variants: { id: string, stepId: string }[], steps: WorkflowStep[]): { id: string, status: string }[] {
  //   const statuses: { id: string, status: string }[] = [];

  //   variants.forEach(variant => {
  //     const step = steps.find(x => x.id === variant.stepId);
  //     if (step)
  //       statuses.push({ id: variant.id, status: step.status?.name as string });
  //   });

  //   return statuses;
  // }

  createDocumentAndVersion(productId: string, parentId: string, ticketId: string, versionLabel: string, documentName?: string, documentReference?: string): Observable<any> {
    return this.createDocument(productId, parentId, documentName, documentReference).pipe(
      mergeMap(docId => this.http.get<BaseDocument>(`${this.documentUrl}/${docId}`).pipe(
        retry(),
        mergeMap(() => this.createVersion(docId, ticketId, versionLabel))
      ))
    );
  }

  createDocument(productId: string, parentId: string, name?: string, reference?: string): Observable<any> {
    const url = `${this.documentUrl}`;
    const payload = { productId, parentId, name, reference };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      this.documentCreated$.next({ id: x, productId, parentId, name, reference, admin: false } as BaseDocument);
    }));
  }

  renameDocument(id: string, name: string): Observable<any> {
    const url = `${this.documentUrl}/${id}/change-name`;
    const payload = { name };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      this.documentRenamed$.next({ id, name });
      
      // Reemit document with new name
      const document = this.document$.getValue();
      if (document)
        document.name = name;
      this.document$.next(document);
    }));
  }

  updateDocumentReference(id: string, reference: string): Observable<any> {
    const url = `${this.documentUrl}/${id}/change-reference`;
    const payload = { reference };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      this.documentReferenceUpdated$.next({ id, reference });

      // Reemit document with new reference
      const document = this.document$.getValue();
      if (document)
        document.reference = reference;
      this.document$.next(document);
    }));
  }

  createVersion(documentId: string, ticketId: string, label: string): Observable<string> {
    const url = `${this.versionUrl}`;
    const payload = { documentId, ticketId, label };
    this.creatingVersion$.next(true);

    return this.http.post<string>(url, payload, httpOptions).pipe(
      tap(id => {
        // Add to the list of versions in the document
        const document = this.document$.getValue();
        document?.versions.push(new BaseVersionLite(id, label, ticketId));
        this.document$.next(document);
      }),
      mergeMap(id => this.http.get<TVersion>(`${this.versionUrl}/${id}`).pipe(
        retry(),
        map(() => id),
        tap(() => this.creatingVersion$.next(false)),
        catchError(() => { this.creatingVersion$.next(false); return of('Timeout Error'); })
      ))
    );
  }

  cloneVersion(sourceId: string, ticketId: string, label: string): Observable<string> {
    const url = `${this.versionUrl}/clone`;
    const payload = { sourceId, ticketId, label };
    this.creatingVersion$.next(true);
  
    return this.http.post<string>(url, payload, httpOptions).pipe(
      tap(id => {
        // Add to the list of versions in the document
        const document = this.document$.getValue();
        document?.versions.push(new BaseVersionLite(id, label, ticketId));
        this.document$.next(document);
      }),
      switchMap(id =>
        interval(10000).pipe(
          take(10),
          mergeMap(() =>
            this.http.get<TVersion>(`${this.versionUrl}/${id}`).pipe(
              catchError(response => of(false))
            )
          ),
          filter(response => !!response),
          map(() => id),
          tap(() => this.creatingVersion$.next(false)),
          catchError(() => {
            this.creatingVersion$.next(false);
            return of('Clone Failed after 10 retries');
          })
        )
      )
    );
  }

  cloneValues(id: string, sourceVersionId: string, sourceValuesLength: number = 0): Observable<any> {
    const url = `${this.versionUrl}/${id}/clone/values`;
    const payload = { sourceVersionId };
    this.creatingVersion$.next(true);

    return this.http.post(url, payload, httpOptions)
      .pipe(
        catchError(() => { this.creatingVersion$.next(false); return of(null); }),
        switchMap(() => this.pollForMatchingValues(id, sourceValuesLength))
      );
  }

  pollForMatchingValues(id: string, sourceValuesLength: number): Observable<any> {
    if (!id || id === 'Timeout Error')
      return throwError('id cannot be null');

    let retries = 0;

    return interval(10000).pipe(
      takeWhile(() => retries < 10), // Limit retries to 10
      mergeMap(() =>
        this.getValues(id).pipe(
          catchError(err => {
            retries++;
            return of(null);
          })
        )
      ),
      filter(values => sourceValuesLength === values?.length),
      tap(() => this.creatingVersion$.next(false)),
      catchError(err => {
        this.creatingVersion$.next(false);

        // Handle other errors or retries reaching limit
        if (retries === 10)
          return throwError('Maximum retries reached for getValues');
        else
          return throwError(err); // Re-throw other errors
      })
    );
  }

  getValues(id: string): Observable<any[]> {
    if (!id || id == 'Timeout Error')
      return throwError('id cannot be null');

    const url = `${this.versionUrl}/${id}/values`;
    return this.http.get<any[]>(url);
  }


  computeVersionId(id: string): string | undefined {
    let computedId: string | undefined = id;
    if (computedId === 'default') {
      // Retrieve the document and the product id
      const document = this.document$.getValue();
      const productId = document?.productId || '';
      // Retrieve the navigation mode from the localStorage
      const navigationData = JSON.parse(localStorage.getItem(this.NAVIGATION_MODE_DATA) || '{}');
      const productNavigationData = navigationData[productId] || { mode: 'latest' };
      if (productNavigationData.mode === 'latest') {
        // Return latest published version if one exists, otherwise return latest created one
        // If version is not found, return null
        const latestId = document?.versions.find(x => x.isLatestReleased)?.id;
        computedId = latestId || document?.versions[document?.versions.length - 1]?.id;
      } else if (productNavigationData.mode === 'ticket') {
        // Return version associated with the ticket if one exists
        // Otherwise, return the version valid for that ticket
        // If version is not found, return null
        const versionIdForTicket = document?.versions.find(x => x.ticketId === productNavigationData.data.id)?.id;

        // Check if ticket is released
        const dateLimit = productNavigationData.data.releaseDate ?? new Date();
        // Find versions before release or creation
        const releases = document?.versions.filter(x => !!x.publishedOn && new Date(x.publishedOn) < new Date(dateLimit));

        computedId = versionIdForTicket ||
          releases?.sort((a, b) => (a.publishedOn < b.publishedOn) ? -1 : (a.publishedOn === b.publishedOn) ? 0 : 1)[releases?.length - 1]?.id ||
          'error';
      }
    }
    return computedId;
  }

  synchronizeWithVersion(id: string, synchWithVersionId: string) {
    const url = `${this.versionUrl}/${id}/synch-with-version`;
    const payload = { synchWithVersionId };
    return this.http.post<string>(url, payload, httpOptions).pipe(tap(x => {
      const version = this.version$.getValue();
      if (version) {
        version.synchedWithVersionId = synchWithVersionId;
        this.version$.next(version);
      }
    }));
  }

  // Update variant status in version after successful transition has taken place
  setVersionStatuses(variantsStatus: { id: string, status: string }[]) {
    const version = this.version$.getValue();
    if (version) {
      variantsStatus.forEach(variantStatus => {
        version.statuses[variantStatus.id] = variantStatus.status;
      });

      this.version$.next(version);
    }
  }

  // Get current status of global/variant from workflow by id
  getCurrentStatusFromWorkflow(id: string): string {
    const version = this.version$.getValue();
    return version?.statuses?.[id] || '';
  }

  // Retrieve the help text for the helpInfoKey
  getHelpText(helpInfoKey?: string): Observable<{ title: string, content: string } | undefined> {
    if (!helpInfoKey)
      return of(undefined)

    // Retrieve the id of the help document
    const helpDocumentVersionId = helpInfoKeys[helpInfoKey];

    if (!helpDocumentVersionId)
      return of(undefined)

    // Retrieve the help text from the documentation module
    const url = `${environment.baseUrl}document-versions/${helpDocumentVersionId}`;

    // Return the help document
    return this.http.get<any>(url).pipe(
      map(x => ({ title: x.title, content: x.content })),
      catchError(error => of(undefined))
    );
  }

  // Retrieve the list of versions that can be imported from
  getVersionsByProductId(productId: string, name: string): Observable<BaseVersionLite[] | null> {
    const url = `${this.documentUrl}?productId=${productId}&name=${name}`;
    return this.http.get<BaseDocument>(url).pipe(
      tap(doc => { this.importableDocument$.next(doc); }),
      map(doc => doc.versions),
      tap(versions => { this.importableVersions$.next(versions); })
    );
  }

  // Set version offset
  setVersionOffset(id: string, versionOffset: number): Observable<any> {
    const url = `${this.documentUrl}/${id}/change-version-offset`;
    const payload = { versionOffset };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      // Reemit document with updated details
      const document = this.document$.getValue();
      if (document)
        document.versionOffset = versionOffset;
      this.document$.next(document);
    }));
  }

  // Reassign ticket
  reassignTicket(id: string, ticketId: string): Observable<any> {
    const url = `${this.versionUrl}/${id}/reassign-ticket`;
    const payload = { ticketId };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      // Reemit version with updated ticket
      const version = this.version$.getValue();
      if (version)
        version.ticketId = ticketId;

      const document = this.document$.getValue();
      if (document) {
        const documentVersion = document.versions.find(v => v.id == id);
        if (documentVersion)
          documentVersion.ticketId = ticketId

        this.document$.next(document);
      }
      this.version$.next(version);
    }));
  }

  renameVersion(id: string, label: string): Observable<any> {
    const url = `${this.versionUrl}/${id}/change-label`;
    const payload = { label };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      // Reemit version with new name
      const version = this.version$.getValue();
      if (version) {
        this.versionRenamed$.next({ documentId: version.documentId, id, label });
        version.label = label;
        this.version$.next(version);
      }
    }));
  }

  calculateRevisionLevel(document: BaseDocument, releaseDate: Date, isPublished: boolean): number {
    // Calculate revision level
    const targetDate = isPublished ? releaseDate : new Date();
    const publishedVersionsBeforeTargetDate = document.versions.filter(version => version.isPublished && new Date(version.publishedOn) < new Date(targetDate));
    return publishedVersionsBeforeTargetDate.length + (+document.versionOffset || 0) + 1;
  }

  // Helper method to convert revision level to revision letter
  // Using rev "-" as the first revision
  convertRevisionLevelToLetter(revisionLevel: number): string {
    if (revisionLevel === 1)
      return "-";

    revisionLevel -= 1;

    var temp, letter = '';
    while (revisionLevel > 0) {
      temp = (revisionLevel - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      revisionLevel = (revisionLevel - temp - 1) / 26;
    }
    return letter;
  }

  // Used to clear data when selecting a new version
  abstract clearData(): void;
}
