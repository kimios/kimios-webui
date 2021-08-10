import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, iif, Observable, of} from 'rxjs';

import {
  AdministrationService,
  Document as KimiosDocument,
  Folder,
  SecurityService,
  User,
  Workspace,
  DocumentType as KimiosDocumentType,
  StudioService
} from 'app/kimios-client-api';
import {FormBuilder, FormGroup} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {concatMap, filter, map, startWith, tap, toArray} from 'rxjs/operators';
import {SearchEntityService} from 'app/services/searchentity.service';
import {SearchEntityQuery} from 'app/main/model/search-entity-query';
import {BrowseTreeDialogComponent} from 'app/main/components/browse-tree-dialog/browse-tree-dialog.component';
import {MatDialog} from '@angular/material';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class SearchFormComponent implements OnInit {
  searchFormGroup: FormGroup;
  filteredDocuments$: BehaviorSubject<KimiosDocument>;
  filteredUsers$: Observable<Array<User>>;
  selectedUser: User;
  allUsers: Array<User>;
  filteredTags$: Observable<Array<string>>;
  selectedTags: Array<string>;
  allTags: Array<string>;
  allTags$: Observable<Array<string>>;
  allDocumentTypes: Array<KimiosDocumentType>;
  filteredDocumentTypes$: Observable<Array<KimiosDocumentType>>;

  selectedContainerEntity: Folder | Workspace;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = false;
  private selectedDocumentType: KimiosDocumentType;

  constructor(
      private fb: FormBuilder,
      private searchEntityService: SearchEntityService,
      public dialog: MatDialog,
      private bes: BrowseEntityService,
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private studioService: StudioService
  ) {
    this.filteredUsers$ = new Observable<Array<User>>(null);
    this.filteredTags$ = new Observable<Array<string>>(null);
    this.selectedTags = new Array<string>();
    this.allUsers = new Array<User>();
    this.allDocumentTypes = new Array<KimiosDocumentType>();
    this.filteredDocumentTypes$ = new Observable<Array<KimiosDocumentType>>(null);

    this.searchFormGroup = this.fb.group({
      'name': this.fb.control(''),
      'id': this.fb.control(''),
      'content': this.fb.control(''),
      'tagInput': this.fb.control(this.selectedTags),
      'owner': this.fb.control(''),
      'folder': this.fb.control(''),
      'dateMin': this.fb.control(''),
      'dateMax': this.fb.control(''),
      'documentType': this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.allTags$ = this.searchEntityService.retrieveAllTags()
        .pipe(
            tap(res => console.log('retrieved ' + res.size)),
            map(res => Array.from(res.keys())),
            tap(res => this.allTags = res),
        );

    this.filteredTags$ = this.searchFormGroup.get('tagInput').valueChanges.pipe(
        startWith(null),
        map((tag: string | null) =>
            tag !== null && tag.trim() !== '' ?
                this.filterTags(this.allTags, tag, this.selectedTags) :
                this.filterTags(this.allTags, null, this.selectedTags))
    );

    if (this.searchEntityService.currentSearchEntityQuery != null
        && this.searchEntityService.currentSearchEntityQuery !== undefined) {
      this.searchEntityService.loadQuery(this.searchEntityService.currentSearchEntityQuery);
      this.initFormFromQuery(this.searchFormGroup, this.searchEntityService.currentSearchEntityQuery);
    }

    this.filteredUsers$ = this.searchFormGroup.get('owner').valueChanges.pipe(
        filter(value =>  ! (value instanceof Object)),
        startWith(null),
        concatMap(inputVal => iif(
            () => inputVal != null,
            of(this.filterUsers(this.allUsers, inputVal, this.selectedUser)),
            this.initAndReturnAllUsers()
        ))
    );

    this.filteredDocumentTypes$ = this.searchFormGroup.get('documentType').valueChanges.pipe(
        filter(value =>  ! (value instanceof Object)),
        startWith(null),
        concatMap(inputVal => iif(
            () => inputVal != null,
            of(this.filterDocumentTypes(this.allDocumentTypes, inputVal, this.selectedDocumentType)),
            this.initAndReturnAllDocumentTypes()
        ))
    );
  }

  onSubmit(): void {
    this.searchEntityService.searchWithFiltersAndSetCurrentQuery(
        this.searchFormGroup.get('content').value,
        this.searchFormGroup.get('name').value,
        this.selectedTags,
        this.searchFormGroup.get('id').value,
        this.selectedContainerEntity,
        this.searchFormGroup.get('owner').value instanceof Object ?
            this.searchFormGroup.get('owner').value.uid
            + '@'
            + this.searchFormGroup.get('owner').value.source :
            this.searchFormGroup.get('owner').value
        ,
        this.searchFormGroup.get('dateMin').value,
        this.searchFormGroup.get('dateMax').value,
        false
    ).subscribe(

    );
  }

  selectedDocumentName(): void {

  }

  selectUser(): void {
    this.selectedUser = this.searchFormGroup.get('owner');
    this.searchFormGroup.get('owner').disable();
  }

  selectedTag(value: string): void {
    if (! this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    this.searchFormGroup.get('tagInput').setValue('');
  }

  unselectTag(tag: string): void {
    const tagIndex = this.selectedTags.findIndex(t => t === tag);
    if (tagIndex !== -1) {
      this.selectedTags.splice(tagIndex, 1);
      this.searchFormGroup.get('tagInput').setValue('');
    }
  }

  private filterTags(allTags: Array<string>, tag: string, excludedTags: Array<string>): Array<string> {
    return this.allTags.filter(t =>
        (tag != null ? t.includes(tag.trim()) : true)
        && excludedTags != null
        && !excludedTags.includes(t)
    );
  }

  private initFormFromQuery(formGroup: FormGroup, searchEntityQuery: SearchEntityQuery): void {
    formGroup.get('name').setValue(searchEntityQuery.name);
    formGroup.get('id').setValue(searchEntityQuery.id);
    formGroup.get('content').setValue(searchEntityQuery.content);
    formGroup.get('owner').setValue(searchEntityQuery.owner);
    formGroup.get('folder').setValue(searchEntityQuery.folder);
    formGroup.get('dateMin').setValue(searchEntityQuery.dateMin);
    formGroup.get('dateMax').setValue(searchEntityQuery.dateMax);

    this.selectedTags = searchEntityQuery.tags;
    formGroup.get('tagInput').setValue('');
  }

  openUserList(): void {

  }

  openFolderTree(): void {
    const dialog = this.dialog.open(BrowseTreeDialogComponent);

    dialog.afterClosed().pipe(
        filter(res => res === true),
        concatMap(containerUid => this.bes.retrieveContainerEntity(this.bes.chosenContainerEntityUid$.getValue()))
    ).subscribe(
        container => {
          this.selectedContainerEntity = container;
          this.searchFormGroup.get('folder').setValue(container.path);
          this.searchFormGroup.get('folder').disable();
        }
    );
  }

  deselectContainerEntity(): void {
    this.selectedContainerEntity = null;
    this.searchFormGroup.get('folder').setValue('');
    this.searchFormGroup.get('folder').enable();
  }

  private filterUsers(allUsers: Array<User>, inputVal: string, excludedUser: User): Array<User> {
    return this.allUsers.filter(user => (
        inputVal == null
        || inputVal === undefined
        || inputVal.trim() === ''
        || user.uid.toLowerCase().includes(inputVal.trim().toLowerCase())
        || user.firstName.toLowerCase().includes(inputVal.trim().toLowerCase())
        || user.lastName.toLowerCase().includes(inputVal.trim().toLowerCase())
        ) && (
        excludedUser == null
        || excludedUser.uid !== user.uid
        || excludedUser.source !== user.source
        )
    );
  }

  private initAndReturnAllUsers(): Observable<Array<User>> {
    return this.securityService.getAuthenticationSources().pipe(
        concatMap(sources => sources),
        concatMap(source => this.securityService.getUsers(
            this.sessionService.sessionToken,
            source.name
        )),
        concatMap(users => users),
        map(user => user),
        tap(user => this.allUsers.push(user)),
        toArray()
    );
  }

  displayAutoCompleteUser(user: User): string {
    return user != null && user !== undefined && user instanceof Object ?
        user.lastName
        + ', '
        + user.firstName
        + ' ('
        + user.uid
        + '@'
        + user.source
        + ')' :
        '';
  }

  deselectUser(): void {
    this.selectedUser = null;
    this.searchFormGroup.get('owner').setValue('');
    this.searchFormGroup.get('owner').enable();
  }

  selectDocumentType(): void {
    this.selectedDocumentType = this.searchFormGroup.get('documentType').value;
    this.searchFormGroup.get('documentType').disable();
  }

  deselectDocumentType(): void {
    this.selectedDocumentType = null;
    this.searchFormGroup.get('documentType').setValue('');
    this.searchFormGroup.get('documentType').enable();
  }

  private filterDocumentTypes(allDocumentTypes: Array<KimiosDocumentType>, inputVal: string, excludedDocumentType: KimiosDocumentType): Array<KimiosDocumentType> {
    return this.allDocumentTypes.filter(docType => (
        inputVal == null
        || inputVal === undefined
        || inputVal.trim() === ''
        || docType.name.toLowerCase().includes(inputVal.trim().toLowerCase())
        ) && (
        excludedDocumentType == null
        || excludedDocumentType.name !== docType.name
        )
    );
  }

  private initAndReturnAllDocumentTypes(): Observable<Array<KimiosDocumentType>> {
    return this.studioService.getDocumentTypes(this.sessionService.sessionToken).pipe(
        tap(res => this.allDocumentTypes = res)
    );
  }

  displayAutoCompleteDocumentType(docType: KimiosDocumentType): string {
    return docType.name;
  }
}
