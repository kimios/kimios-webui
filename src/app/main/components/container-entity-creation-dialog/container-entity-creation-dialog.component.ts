import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatExpansionPanel} from '@angular/material';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {CdkDragDrop, CdkDragEnter} from '@angular/cdk/drag-drop';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {concatMap, filter, tap} from 'rxjs/operators';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {Folder, Workspace} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {ErrorDialogComponent} from 'app/main/components/error-dialog/error-dialog.component';
import {forbiddenCharactersValidator} from 'app/main/utils/form-utils';
import {SessionService} from 'app/services/session.service';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';

export interface ContainerEntityCreationDialogData {
  entityType: 'workspace' | 'folder';
  parentId: number;
}

@Component({
  selector: 'container-entity-creation-dialog',
  templateUrl: './container-entity-creation-dialog.component.html',
  styleUrls: ['./container-entity-creation-dialog.component.scss'],
  providers:  [ EntityCreationService ]
})
export class ContainerEntityCreationDialogComponent implements OnInit {

  @Input()
  selectedUsersAndGroups: Array<UserOrGroup>;
  selectedUsersAndGroups$: BehaviorSubject<Array<UserOrGroup>>;
  groupListId = 'groupList';
  userListId = 'userList';

  // @ViewChild('fileSecurityForm') fileSecurityForm: ElementRef;
  entityCreationForm: FormGroup;
  documentId: number;
  parentEntity: Workspace | Folder;
  parentEntity$: Subject<Workspace | Folder>;
  errorOnCreation$: Subject<string>;
  parentReloadToDo$: Subject<number>;

  @ViewChild('securityPanel') securityPanel: MatExpansionPanel;

  constructor(
      public dialogRef: MatDialogRef<ContainerEntityCreationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ContainerEntityCreationDialogData,
      private entityCreationService: EntityCreationService,
      private browseEntityService: BrowseEntityService,
      private adminService: AdminService,
      private fb: FormBuilder,
      private entityCacheService: EntityCacheService,
      private dialog: MatDialog,
      private sessionService: SessionService,
      public confirmDialog: MatDialog
  ) {
    this.selectedUsersAndGroups$ = new BehaviorSubject<Array<UserOrGroup>>([]);
    this.selectedUsersAndGroups = new Array<UserOrGroup>();

    this.documentId = undefined;
    this.errorOnCreation$ = new Subject<string>();
    this.parentEntity$ = new Subject<Workspace | Folder>();
    this.parentReloadToDo$ = new Subject<number>();
  }

  ngOnInit(): void {
    this.entityCreationForm = this.fb.group({
      'name': this.fb.control('', [
        Validators.required,
        forbiddenCharactersValidator(/^.*(?:\\|\/|\||:|\*|\?|"|<|>).*$/)
      ])
    });

    if (this.data.entityType === 'folder') {
      if (this.data.parentId != null
        && this.data.parentId !== undefined) {
        this.browseEntityService.getEntity(this.data.parentId).pipe(
          tap(parentEntity => this.parentEntity = parentEntity),
          tap(parentEntity => this.parentEntity$.next(parentEntity))
        ).subscribe();
      } else {
        this.parentEntity = this.browseEntityService.currentPath.getValue().slice().reverse()[0];
        this.parentEntity$.next(this.parentEntity);
      }
    }

    this.errorOnCreation$.pipe(
      tap(errorStr => this.openErrorDialog(errorStr))
    ).subscribe(

    );

    this.parentReloadToDo$.pipe(
      concatMap(parentUid => this.entityCacheService.reloadEntityChildren(this.parentEntity.uid)),
      tap(() => {
        if (this.parentEntityIsCurrentPath()) {
          this.browseEntityService.selectedEntity$.next(this.parentEntity);
        }
        this.browseEntityService.onAddedChildToEntity$.next(this.parentEntity.uid);
      })
    ).subscribe();

    this.entityCreationForm.statusChanges.pipe(
      tap(() => this.updateDirtyFormStatus())
    ).subscribe();

    this.entityCreationForm.valueChanges.pipe(
      tap(() => this.updateDirtyFormStatus())
    ).subscribe();
  }

  drop($event: CdkDragDrop<UserOrGroup>): void {
    this.entityCreationService.newUserOrGroupTmp$.next($event.item.data);
  }

  dropListEnter($event: CdkDragEnter<UserOrGroup>): void {
  }

  dropListExited($event: CdkDragEnter<UserOrGroup>): void {

  }

  submit(): void {
    // create entity
    if (this.documentId !== undefined ) {
      this.entityCreationService.onFormSubmitted$.next(this.documentId);
      this.entityCreationService.onFormSecuritiesSubmitted$.subscribe(
          null,
          // error => console.log('error when creating entity: ' + error.error.message)
      );
    } else {
      if (this.entityCreationForm.invalid) {
        return;
      }
      this.entityCreationService.createContainerEntity(
          this.entityCreationForm.get('name').value,
          this.data.entityType,
          this.parentEntity != null && this.parentEntity !== undefined ?
              this.parentEntity.uid :
              null
      ).pipe(
        // make securities form submit securities
        tap(uidCreated => {
          this.documentId = uidCreated;
          this.entityCreationService.onFormSubmitted$.next(uidCreated);
          if (this.data.entityType === 'workspace') {
            this.browseEntityService.onNewWorkspace.next(uidCreated);
          }
          if (this.data.entityType === 'folder') {
            this.parentReloadToDo$.next(this.parentEntity.uid);
          }
        })
      ).subscribe(
        next => this.dialogRef.close(),
          error => {
            this.openErrorDialog(error.error.message);
            if (error.error.message.includes('already exists')) {
              this.entityCreationForm.get('name').setErrors({'existing': true});
            }
          },
        () => this.dialogRef.close()
      );
    }
  }

  cancel(): void {
    if (this.sessionService.dirtyForm$.getValue() === false) {
      this.dialogRef.close();
    } else {
      this.openConfirmDialog('You have unsaved work', ['Any modification will be lost. Are you sure?']);
    }
  }

  openConfirmDialog(title: string, messageLines: Array<string>): void {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle: title,
        messageLine1: messageLines[0]
      }
    });

    dialogRef.afterClosed().pipe(
      filter(res => res === true),
      tap(() => this.dialogRef.close())
    ).subscribe();
  }

  private parentEntityIsCurrentPath(): boolean {
    const currentPathEntity = this.browseEntityService.currentPath.getValue().slice().reverse()[0];
    return currentPathEntity.uid === this.parentEntity.uid;
  }

  handleSecurityPanelClick(): void {
    if (this.securityPanel.closed) {
      if (this.entityCreationForm.get('name').value.length === 0) {
        this.entityCreationForm.get('name').markAsTouched();
        this.entityCreationForm.get('name').setErrors({'empty': true});
      }
    }
  }

  private openErrorDialog(errorStr: string): void {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Error on ' + this.data.entityType + ' creation',
        message: errorStr
      }
    });
  }

  updateDirtyFormStatus(): void {
    if (this.entityCreationForm.dirty) {
      this.sessionService.dirtyForm$.next(true);
    } else {
      this.sessionService.dirtyForm$.next(false);
    }
  }
}
