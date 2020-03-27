import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BehaviorSubject} from 'rxjs';
import {UserOrGroup} from 'app/main/components/users-and-groups-selection-panel/users-and-groups-selection-panel.component';
import {CdkDragDrop, CdkDragEnter} from '@angular/cdk/drag-drop';
import {EntityCreationService} from 'app/services/entity-creation.service';

export interface ContainerEntityCreationDialogData {
  entityType: 'workspace' | 'folder';
}

@Component({
  selector: 'container-entity-creation-dialog',
  templateUrl: './container-entity-creation-dialog.component.html',
  styleUrls: ['./container-entity-creation-dialog.component.scss']
})
export class ContainerEntityCreationDialogComponent implements OnInit {

  @Input()
  selectedUsersAndGroups: Array<UserOrGroup>;
  selectedUsersAndGroups$: BehaviorSubject<Array<UserOrGroup>>;
  groupListId = 'groupList';
  userListId = 'userList';

  // @ViewChild('fileSecurityForm') fileSecurityForm: ElementRef;

  constructor(
      public dialogRef: MatDialogRef<ContainerEntityCreationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ContainerEntityCreationDialogData,
      private entityCreationService: EntityCreationService
  ) {
    this.selectedUsersAndGroups$ = new BehaviorSubject<Array<UserOrGroup>>([]);
    this.selectedUsersAndGroups = new Array<UserOrGroup>();
  }

  ngOnInit(): void {
  }

  drop($event: CdkDragDrop<UserOrGroup>): void {
    this.entityCreationService.newUserOrGroupTmp$.next($event.item.data);
  }

  dropListEnter($event: CdkDragEnter<UserOrGroup>): void {
  }

  dropListExited($event: CdkDragEnter<UserOrGroup>): void {

  }

  submit($event: MouseEvent): void {
    /*this.fileSecurityForm.nativeElement.submit().toObservable().subscribe(
        next => console.log('submit ?')
    );*/
  }

  cancel($event: MouseEvent): void {

  }
}
