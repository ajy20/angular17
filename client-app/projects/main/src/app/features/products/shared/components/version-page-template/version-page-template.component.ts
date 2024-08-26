import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { PageTemplateComponent } from '../../../../../shared/page-template/page-template.component';
import { BaseVersion } from './models/base-version.model';
import { BaseVersionComparison } from './models/version-comparison.model';
import { VersionPageService } from './services/version-page.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { DynamicFormService } from '../../../../../shared/dynamic-form/services/dynamic-form.service';
import { combineLatest, concat, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { AnomaliesComponent } from '../anomalies/anomalies.component';
import { faBroom, faClock, faCodeBranch, faCog, faEllipsisV, faExclamationTriangle, faPen, faQuestionCircle, faSitemap, faSync, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { BaseDocument } from './models/document.model';
import { ModalConfig } from '../../../../../shared/dynamic-form/models/modal-config.interface';
import { CustomValidators } from '../../../../../shared/dynamic-form/custom-validators/custom-validators';
import { FieldConfig } from '../../../../../shared/dynamic-form/models/field-config.interface';
import { TicketService } from '../../ticket.service';
import { BehaviourOptions } from './models/behaviour-options';

@Component({
  selector: 'csps-version-page-template',
  standalone: true,
  imports: [CommonModule, PageTemplateComponent, NgbAlertModule, FontAwesomeModule],
  templateUrl: './version-page-template.component.html',
  styleUrl: './version-page-template.component.scss'
})
export class VersionPageTemplateComponent<TVersion extends BaseVersion, TVersionComparison extends BaseVersionComparison> {

  // Icons
  faCodeBranch: IconDefinition = faCodeBranch;
  faQuestionCircle: IconDefinition = faQuestionCircle;
  faBroom: IconDefinition = faBroom;
  faSitemap: IconDefinition = faSitemap;
  faClock: IconDefinition = faClock;
  faExclamationTriangle: IconDefinition = faExclamationTriangle
  faCog: IconDefinition = faCog;
  faSync: IconDefinition = faSync;
  faPen: IconDefinition = faPen;
  faEllipsisV: IconDefinition = faEllipsisV;

  // Input service must extends VersionPageService
  @Input() service!: VersionPageService<TVersion, TVersionComparison>;

  // The list of anomalies
  @Input() anomalies: { id: string, anomaly: string }[] = [];

  // Help Text
  @Input() helpInfoKey?: string;

  // Behaviour Options
  @Input() behaviourOptions?: BehaviourOptions;

  // Nested version check to update ticket reassignment screen accordingly
  @Input() hasNestedVersions?: boolean;
  // @Input() computeTicketReassignmentAffectedVersions: (newTicketId: string, label: string) => { versions: { id: string, name: string }[], calls: Observable<any>[] };

  // The event emitter to clean anomalies
  @Output() cleanAnomalies = new EventEmitter();

  // Comparison result output
  @Output() comparisonFinished = new EventEmitter<boolean>();


  // The unitary behaviours
  canRename: boolean = false;
  canChangeReference: boolean= false;

  // The feature list document for the selected product id
  selectedDocument!: BaseDocument;

  // The selected version
  selectedVersion!: TVersion;

  // Indicate whether the selected version is the latest released version
  isLatestReleasedVersion: boolean = false;

  // Indicate whether a synchronisation is needed with the latest released version
  synchronisationNeeded: boolean = false;

  // The id of latest published version
  latestReleasedVersionId!: string;

  // The ticket list
  tickets: any[] = [];

  // roles: Role[] = [];

  // Used for cleaning up subscription
  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private ticketService: TicketService,
    private dynamicFormService: DynamicFormService,
  ) { }

  ngOnInit(): void {
    this.ticketService.getTicketList(this.selectedDocument.productId).pipe(
      map(ticketList => ticketList.tickets),
      take(1)
    ).subscribe(x => {
      this.tickets = x;
    });

    if (this.anomalies.length)
      this.openAnomaliesManager();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnChanges(): void {
    this.canRename = this.behaviourOptions ? this.behaviourOptions.canRename : false;
    this.canChangeReference = this.behaviourOptions ? this.behaviourOptions.canChangeReference : false;

    // Subscribe to document and version
    const observables = [
      this.service.document$.pipe(takeUntil(this.unsubscribe)),
      this.service.version$.pipe(takeUntil(this.unsubscribe)),
      // this.roleService.roles$.pipe(takeUntil(this.unsubscribe)),
    ];

    combineLatest(...observables).pipe(takeUntil(this.unsubscribe)).subscribe(([document, version]) => {
      // Update selected document and version
      this.selectedDocument = document as any;
      this.selectedVersion = version as any;
      // this.roles = roles;
      // Store the information about the latest released version
      const latestReleasedVersion = this.selectedDocument?.versions?.find(x => !!x.isLatestReleased);
      this.latestReleasedVersionId = latestReleasedVersion?.id || '';
      this.isLatestReleasedVersion = this.selectedVersion?.id === this.latestReleasedVersionId;

      // Check synchronised version vs latest released
      this.synchronisationNeeded = this.latestReleasedVersionId !== '' && !this.isLatestReleasedVersion && this.selectedVersion?.synchedWithVersionId !== this.latestReleasedVersionId && !this.selectedVersion?.released;
    });
  }


  // Open the rename modal
  openRenameDocument() {
    const config: ModalConfig = {
      headerText: `Rename document ${this.selectedDocument.name}`,
      submitText: 'Edit',
      closeText: 'Cancel',
      labelSize: 3,
      extraButtons: [],
      onSubmit: (e: { name: string, reference: string }) => {
        // const calls = [
        //   ...(e.name && e.name !== this.selectedDocument.name) ? [this.service.renameDocument(this.selectedDocument.id, e.name).pipe(take(1))] : [],
        //   ...(e.reference && e.reference !== this.selectedDocument.reference) ? [this.service.updateDocumentReference(this.selectedDocument.id, e.reference).pipe(take(1))] : []
        // ];

        // concat(...calls).subscribe(x => { });
      },
      onDismiss: (e: string) => { },
      fields: [
        ...(this.canRename) ? [{
          type: 'input',
          label: 'Name',
          name: 'name',
          placeholder: 'Enter document name',
          value: this.selectedDocument.name,
          validation: [
            CustomValidators.required('Document name required'),
          ]
        } as FieldConfig] : [],
        ...(this.canChangeReference) ? [{
          type: 'input',
          label: 'Reference',
          name: 'reference',
          placeholder: 'Enter document reference',
          value: this.selectedDocument.reference,
          validation: []
        } as FieldConfig] : []
      ]
    }
    this.dynamicFormService.popDynamicFormModal(config);
  }

  // Open the workflow
  openWorkflow() {
    // this.service.getVersionWorkflow(this.selectedVersion.id).pipe(take(1)).subscribe(w => {
    //   const config = {
    //     workflowDefinition: w,
    //     variantDetails: this.selectedVersion.variants || [],
    //     roles: this.roles,
    //     activateTransition: (transitionId: string, variantId: string, variants: { id: string, stepId: string }[], steps: WorkflowStep[]) => this.service.activateTransition(this.selectedVersion.id, transitionId, variants, steps, variantId),
    //     resetWorkflow: () => this.service.resetWorkflow(this.selectedVersion.id),
    //     canResetWorkflow: this.selectedVersion?.canResetWorkflow || false,
    //     admin: true, //this.selectedVersion?.admin,
    //     windowClass: this.selectedVersion.variants?.length ? 'modal-xxxl' : '',
    //     onSubmit: () => { },
    //     onDismiss: () => { }
    //   };

    //   this.dynamicFormService.popModal(WorkflowComponent, config);
    // });
  }

  // Open the version manager
  openVersionManager() {
    // const config = {
    //   versions: this.selectedDocument?.versions.map(v => ({ ...v, title: v.label })),
    //   tickets: this.tickets,
    //   getHistory: (id: string) => this.service.getVersionChangeHistory(id),
    //   admin: this.selectedDocument?.admin,
    //   multiWorkingCopies: true,
    //   showComparison: true,
    //   onSubmit: (e: { type: string, data: any }) => {
    //     const s = {
    //       'view': () => this.loadVersion(e.data.id),
    //       'new': () => this.createNewVersion(),
    //       'compare': () => this.compareVersions(e.data.versionId1, e.data.versionId2, false),
    //     };
    //     s[e.type]();
    //   },
    //   onDismiss: (e: string) => { }
    // };

    // this.dynamicFormService.popModal(VersionManagerComponent, config);
  }

  help() {
    // this.service.getHelpText(this.helpInfoKey).pipe(take(1)).subscribe(doc => {
    //   if (!doc) {
    //     const config: NotificationConfig = {
    //       headerText: 'Help Not Found',
    //       submitText: 'Close',
    //       hideCloseButton: true,
    //       notifications: ['No help available at this time'],
    //       onSubmit: () => { },
    //       onDismiss: () => { }
    //     };

    //     this.dynamicFormService.popNotification(config);
    //   } else {
    //     const config = {
    //       size: 'lg',
    //       backdrop: 'static',
    //       windowClass: 'modal-xxxl',
    //       title: doc.title,
    //       markdown: doc.content,
    //       onSubmit: (e: string) => { },
    //       onDismiss: (e: string) => { }
    //     };

    //     this.dynamicFormService.popModal(HelpViewerComponent, config);
    //   }
    // });
  }
  
  // Open anomaly manager screen with anomaly details
  openAnomaliesManager() {
    const config = {
      anomalies: this.anomalies,
      windowClass: 'modal-xxl',
      admin: true, //this.selectedVersion?.admin,
      onSubmit: (e: { type: string, data: any }) => {
        const s: any = {
          'clean': () => this.doCleanAnomalies(),
        };
        s[e.type]();
      },
      onDismiss: (e: string) => { }
    };

    this.dynamicFormService.popModal(AnomaliesComponent, config);
  }

  // Emit event to clean anomalies
  doCleanAnomalies() {
    this.cleanAnomalies.emit();
  }
}
