import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

import {Document as KimiosDocument, User} from 'app/kimios-client-api';
import {FormBuilder, FormGroup} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {map, startWith, tap} from 'rxjs/operators';
import {SearchEntityService} from 'app/services/searchentity.service';

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

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

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

    console.dir(this.allTags);
  }

  onSubmit(): void {
    
  }

  selectedDocumentName(): void {

  }

  selectedUser(): void {

  }

  selectedTag(value: string): void {
    if (! this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    this.tagInput.nativeElement.value = '';
  }

  unselectTag(tag: string): void {
    const tagIndex = this.selectedTags.findIndex(t => t === tag);
    if (tagIndex !== -1) {
      this.selectedTags.splice(tagIndex, 1);
    }
  }

  private filterTags(allTags: Array<string>, tag: string, excludedTags: Array<string>): Array<string> {
    return this.allTags.filter(t =>
        (tag != null ? t.includes(tag.trim()) : true)
        && excludedTags != null
        && !excludedTags.includes(t)
    );
  }
}
