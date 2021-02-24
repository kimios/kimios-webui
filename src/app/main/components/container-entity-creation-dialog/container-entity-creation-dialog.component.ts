import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BehaviorSubject, combineLatest, of} from 'rxjs';
import {CdkDragDrop, CdkDragEnter} from '@angular/cdk/drag-drop';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {concatMap, tap} from 'rxjs/operators';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {Folder, Workspace} from 'app/kimios-client-api';

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

  constructor(
      public dialogRef: MatDialogRef<ContainerEntityCreationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ContainerEntityCreationDialogData,
      private entityCreationService: EntityCreationService,
      private browseEntityService: BrowseEntityService,
      private fb: FormBuilder
  ) {
    this.selectedUsersAndGroups$ = new BehaviorSubject<Array<UserOrGroup>>([]);
    this.selectedUsersAndGroups = new Array<UserOrGroup>();

    this.documentId = undefined;
  }

  ngOnInit(): void {
    this.entityCreationForm = this.fb.group({
      'name': this.fb.control('')
    });

    if (this.data.entityType === 'folder') {
      of(this.data.parentId != null
          && this.data.parentId !== undefined).pipe(
          concatMap(res => res ?
              this.browseEntityService.getEntity(this.data.parentId) :
              of(this.browseEntityService.currentPath.getValue().slice().reverse()[0])
          ),
          tap(entity => {
            this.parentEntity = entity;
          })
      ).subscribe(
      );
    }
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
          next => next ? alert('securities have been created') : alert('securities NOT created'),
          error => console.log('error when creating entity: ' + error.error.message)
      );
    } else {
      combineLatest(of(this.data.entityType), this.entityCreationService.createContainerEntity(
          this.entityCreationForm.get('name').value,
          this.data.entityType,
          this.parentEntity !== null && this.parentEntity !== undefined ?
              this.parentEntity.uid :
              null
      )).pipe(
          // make securities form submit securities
          concatMap(([entityType, uidCreated]) => {
            this.documentId = uidCreated;
            this.entityCreationService.onFormSubmitted$.next(uidCreated);
            return combineLatest(of(entityType), this.entityCreationService.onFormSecuritiesSubmitted$.asObservable(), of(uidCreated));
          }),
          tap(([entityType, res, uidCreated]) => {
            if (entityType === 'folder') {
              //
              this.browseEntityService.deleteCacheEntry(this.parentEntity.uid);
              if (this.parentEntityIsCurrentPath()) {
                this.browseEntityService.selectedEntity$.next(this.parentEntity);
              }
              this.browseEntityService.onAddedChildToEntity$.next(this.parentEntity.uid);
            } else {
              this.browseEntityService.onNewWorkspace.next(uidCreated);
            }
          })
      ).subscribe(
          next => // this.dialogRef.close(),
          error => console.log('error when creating entity: ' + error.error.message)
      );
    }
  }

  cancel(): void {

  }

  private parentEntityIsCurrentPath(): boolean {
    const currentPathEntity = this.browseEntityService.currentPath.getValue().slice().reverse()[0];
    return currentPathEntity.uid === this.parentEntity.uid;
  }
}
