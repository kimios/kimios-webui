import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

import {Document as KimiosDocument, User} from 'app/kimios-client-api';
import {FormBuilder, FormGroup} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {map, startWith, tap} from 'rxjs/operators';
import {SearchEntityService} from 'app/services/searchentity.service';
import {SearchEntityQuery} from 'app/main/model/search-entity-query';

@Component({
  selector: 'search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class SearchFormComponent implements OnInit {
  searchFormGroup: FormGroup;
  filteredDocuments$: BehaviorSubject<KimiosDocument>;
  filteredUsers$: BehaviorSubject<User>;
  filteredTags$: Observable<Array<string>>;
  selectedTags: Array<string>;
  allTags: Array<string>;
  allTags$: Observable<Array<string>>;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = false;

  constructor(
      private fb: FormBuilder,
      private searchEntityService: SearchEntityService
  ) {
    this.filteredUsers$ = new BehaviorSubject<User>(null);
    this.filteredTags$ = new Observable<Array<string>>(null);
    this.selectedTags = new Array<string>();

    this.searchFormGroup = this.fb.group({
      'name': this.fb.control(''),
      'id': this.fb.control(''),
      'content': this.fb.control(''),
      'tagInput': this.fb.control(this.selectedTags),
      'owner': this.fb.control(''),
      'folder': this.fb.control(''),
      'dateMin': this.fb.control(''),
      'dateMax': this.fb.control('')
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
  }

  onSubmit(): void {
    this.searchEntityService.searchWithFilters(
        this.searchFormGroup.get('content').value,
        this.searchFormGroup.get('name').value,
        this.selectedTags,
        this.searchFormGroup.get('id').value,
        this.searchFormGroup.get('folder').value,
        false
    ).subscribe(

    );
  }

  selectedDocumentName(): void {

  }

  selectedUser(): void {

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
}
