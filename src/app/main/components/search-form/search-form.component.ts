import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, iif, Observable, of} from 'rxjs';

import {
  AdministrationService,
  Document as KimiosDocument,
  DocumentType as KimiosDocumentType,
  DocumentVersionService,
  Folder,
  Meta,
  SecurityService,
  StudioService,
  User,
  Workspace
} from 'app/kimios-client-api';
import {AbstractControl, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {concatMap, filter, map, startWith, tap, toArray} from 'rxjs/operators';
import {SearchEntityService} from 'app/services/searchentity.service';
import {SearchEntityQuery} from 'app/main/model/search-entity-query';
import {BrowseTreeDialogComponent} from 'app/main/components/browse-tree-dialog/browse-tree-dialog.component';
import {MatDialog} from '@angular/material';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {SessionService} from 'app/services/session.service';
import {MetaWithValue} from 'app/main/model/meta-with-value';
import {MetaValueRange, MetaValueRangeDate, MetaValueRangeNumber} from 'app/main/model/meta-value-range';

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
  documentTypeMetaDatas$: BehaviorSubject<Array<Meta>>;
  documentTypeMetaDataValuesMap: Map<number, Array<string | number>>;
  documentTypeMetaDataIds: Array<number>;
  filteredDocumentTypeMetaDataValues$Map: Map<number, BehaviorSubject<Array<string>>>;

  selectedContainerEntity: Folder | Workspace;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = false;
  selectedDocumentType: KimiosDocumentType = null;

  constructor(
      private fb: FormBuilder,
      private searchEntityService: SearchEntityService,
      public dialog: MatDialog,
      private bes: BrowseEntityService,
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private sessionService: SessionService,
      private studioService: StudioService,
      private documentVersionService: DocumentVersionService
  ) {
    this.filteredUsers$ = new Observable<Array<User>>(null);
    this.filteredTags$ = new Observable<Array<string>>(null);
    this.selectedTags = new Array<string>();
    this.allUsers = new Array<User>();
    this.allDocumentTypes = new Array<KimiosDocumentType>();
    this.filteredDocumentTypes$ = new Observable<Array<KimiosDocumentType>>(null);
    this.documentTypeMetaDatas$ = new BehaviorSubject<Array<Meta>>(null);
    this.documentTypeMetaDataValuesMap = new Map<number, Array<string | number>>(null);
    this.documentTypeMetaDataIds = new Array<number>();
    this.filteredDocumentTypeMetaDataValues$Map = new Map<number, BehaviorSubject<Array<string>>>();

    this.searchFormGroup = this.fb.group({
      'name': this.fb.control(''),
      'id': this.fb.control(''),
      'content': this.fb.control(''),
      'tagInput': this.fb.control(this.selectedTags),
      'owner': this.fb.control(''),
      'folder': this.fb.control(''),
      'dateMin': this.fb.control(''),
      'dateMax': this.fb.control(''),
      'documentType': this.fb.control(''),
      'metas': this.fb.group({})
    });
  }

  ngOnInit(): void {
    this.allTags$ = this.searchEntityService.retrieveAllTags()
        .pipe(
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

    if (this.searchEntityService.currentSearchEntityQuery != null
        && this.searchEntityService.currentSearchEntityQuery !== undefined) {
      this.searchEntityService.loadQuery(this.searchEntityService.currentSearchEntityQuery);
      this.initFormFromQuery(this.searchFormGroup, this.searchEntityService.currentSearchEntityQuery);
    }
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
        this.selectedDocumentType,
        Object.keys((this.searchFormGroup.get('metas') as FormGroup).controls)
            .filter(keyControl => ! new RegExp('^filterControl_').test(keyControl))
            .map(keyControl =>
                this.makeMetaWithValueFromMeta(
                    this.documentTypeMetaDatas$.getValue().filter(meta => meta.uid.toString() === keyControl)[0],
                    this.searchFormGroup.get('metas').get(keyControl)
                )
            ).filter(metaWithValue => metaWithValue.value != null
            && metaWithValue.value !== undefined
            && (
                (typeof metaWithValue.value === 'string' && metaWithValue.value !== '')
                || (metaWithValue.value instanceof MetaValueRange && !(metaWithValue.value as MetaValueRange).isEmpty())
                || (typeof metaWithValue.value === 'boolean' && metaWithValue.value === true)
            )
        ),
        false
    ).subscribe(

    );
  }

  private makeMetaWithValueFromMeta(meta: Meta, formControl: AbstractControl): MetaWithValue {
    return <MetaWithValue> {
      uid: meta.uid,
      name: meta.name,
      documentTypeUid: meta.documentTypeUid,
      metaFeedUid: meta.metaFeedUid,
      metaType: meta.metaType,
      mandatory: meta.mandatory,
      position: meta.position,
      value: formControl instanceof FormControl ?
          formControl.value :
          meta.metaType === 2 ?
              new MetaValueRangeNumber(
                  (formControl as FormGroup).get('min').value,
                  (formControl as FormGroup).get('max').value
              ) :
              new MetaValueRangeDate(
                  (formControl as FormGroup).get('min').value,
                  (formControl as FormGroup).get('max').value
              )
    };
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

    formGroup.get('documentType').setValue(searchEntityQuery.documentType);
    if (searchEntityQuery.documentType != null) {
      this.loadDocumentTypeMetas(searchEntityQuery.documentType).subscribe(
          () => this.initMetasFormGroupFromQuery(formGroup.get('metas') as FormGroup, searchEntityQuery)
      );
    }
    this.selectedDocumentType = searchEntityQuery.documentType;
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
    const docType = this.searchFormGroup.get('documentType').value;
    this.loadDocumentTypeMetas(docType).subscribe();
  }

  private loadDocumentTypeMetas(docType: KimiosDocumentType): Observable<any> {
    return this.documentVersionService.getMetas(this.sessionService.sessionToken, docType.uid).pipe(
        tap(() => this.documentTypeMetaDataValuesMap = new Map<number, Array<string | number>>()),
        tap(metas => this.documentTypeMetaDatas$.next(metas)),
        tap(metas => this.updateFormControlsWithMetas(this.searchFormGroup, 'metas', metas)),
        concatMap(metas => metas),
        concatMap(meta => combineLatest(
            of(meta),
            meta.metaFeedUid === -1 ?
                of(null) :
                this.studioService.getMetaFeedValues(this.sessionService.sessionToken, meta.metaFeedUid)
        )),
        tap(([meta, metaFeedValues]) => this.updateFormControlsWithMetaValues(this.searchFormGroup, 'metas', meta)),
        tap(([meta, metaFeedValues]) => console.dir(meta)),
        tap(([meta, metaFeedValues]) => console.dir(metaFeedValues)),
        tap(([meta, metaFeedValues]) => this.documentTypeMetaDataValuesMap.set(meta.uid, metaFeedValues)),
        tap(([meta, metaFeedValues]) => this.filteredDocumentTypeMetaDataValues$Map.set(meta.uid, new BehaviorSubject<Array<string>>(metaFeedValues))),
        tap(() => this.documentTypeMetaDataValuesMap.forEach((val, key) =>
            this.documentTypeMetaDataIds.push(key))),
        tap(() => this.searchFormGroup.get('documentType').disable()),
        tap(() => this.selectedDocumentType = this.searchFormGroup.get('documentType').value),
    );
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

  private updateFormControlsWithMetas(form: FormGroup, formGroupName: string, metas: Array<Meta>): void {
    const metasFormGroup = this.fb.group({});
    metas.forEach(meta => metasFormGroup.addControl(String(meta.uid), this.makeFormGroupOrFormControlAccordingToMetaType(meta)));

    form.setControl('metas', metasFormGroup);
  }

  private makeFormGroupOrFormControlAccordingToMetaType(meta: Meta): FormGroup | FormControl {
    if ([2, 3].includes(meta.metaType)) {
      // meta with range
      // so FormGroup must be created
      // with 2 FormControl: one for min and one for max
      const metaFormGroup = this.fb.group({});
      ['min', 'max'].forEach(
          formControlId => metaFormGroup.addControl(formControlId, this.fb.control(''))
      );
      return metaFormGroup;
    } else {
      if (meta.metaType === 4) {
        return this.fb.control(false);
      } else {
        return this.fb.control('');
      }
    }
  }

  onSelectChange(value: any): void {

  }

  onPanelClose(): void {

  }

  private updateFormControlsWithMetaValues(searchFormGroup: FormGroup, formGroupName: string, meta: any): void {
    (searchFormGroup.get(formGroupName) as FormGroup).addControl('filterControl_' + meta.uid, this.fb.control(''));
  }

  inputMetaValueChange(uid: number): void {
    const inputVal = (this.searchFormGroup.get('metas') as FormGroup).get('filterControl_' + uid).value;
    const allValues = this.documentTypeMetaDataValuesMap.get(uid).map(value => String(value));
    this.filteredDocumentTypeMetaDataValues$Map.get(uid).next(
        inputVal.trim().length > 0 ?
            allValues.filter(value => value.includes(inputVal)) :
            allValues
    );
  }

  resetMetaValue(uid: number): void {
    (this.searchFormGroup.get('metas') as FormGroup).get('filterControl_' + uid).setValue('');
    (this.searchFormGroup.get('metas') as FormGroup).get(uid.toString()).setValue('');
  }

  private initMetasFormGroupFromQuery(formGroup: FormGroup, searchEntityQuery: SearchEntityQuery): void {
    if (searchEntityQuery.metas != null
        && searchEntityQuery.metas !== undefined
        && searchEntityQuery.metas.length > 0) {
      searchEntityQuery.metas.forEach(metaWithValue => this.initFormControlFromMetaValue(formGroup.get(metaWithValue.uid.toString()), metaWithValue));
    }
  }

  private initFormControlFromMetaValue(abstractControl: AbstractControl, metaWithValue: MetaWithValue): void {
    if (abstractControl instanceof FormGroup) {
      (abstractControl as FormGroup).get('min').setValue((metaWithValue.value as MetaValueRange).min);
      (abstractControl as FormGroup).get('max').setValue((metaWithValue.value as MetaValueRange).max);
    } else {
      (abstractControl as FormControl).setValue(metaWithValue.value);
    }
  }
}
