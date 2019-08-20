import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {TagService} from 'app/services/tag.service';
import {concatMap, map, startWith, tap} from 'rxjs/operators';
import {Tag} from 'app/main/model/tag';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatChipInputEvent} from '@angular/material';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'file-tags',
  templateUrl: './file-tags.component.html',
  styleUrls: ['./file-tags.component.scss']
})
export class FileTagsComponent implements OnInit {

  allTags$: Observable<Tag[]>;
  allTags: Tag[];
  filteredTags$: Observable<Tag[]>;
  selectable = true;
  removable = true;
  addOnBlur = true;
  tagCtrl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  constructor(
      private tagService: TagService,
      @Inject(DOCUMENT) document
  ) {
    this.allTags$ = this.tagService.loadTags()
        .pipe(
            map(res => res.map(v => new Tag(v.name, v.uid))),
            tap(res => this.allTags = res.sort(
                (t1, t2) => t1.name.localeCompare(t2.name)
            ))
        );
  }

  ngOnInit(): void {
    this.allTags$.subscribe(
        res => this.filteredTags$ = this.initFilteredTags()
    );

  }

  private initFilteredTags(): Observable<Tag[]> {
    return this.tagCtrl.valueChanges.pipe(
        startWith(null),
        map((tag: (string|Tag) | null) =>
            tag ?
                this._filterTags(tag instanceof Tag ? tag.name : tag) :
                this.allTags
                    .slice()
        )
    );
  }

  private _filterTags(value: string): Tag[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.name.toLowerCase().includes(filterValue));
  }

  createAndAddTag($event: MatChipInputEvent): void {
    const input = $event.input;
    const value = $event.value;

    // Add our tag
    if ((value || '').trim()) {
// ask to tagService to create the tag (the meta on the right document type)
      this.tagService.createTag(value)
          .pipe(
              // concatMap(next => this.tagService.loadTags()),
              // map(res => res.map(v => new Tag(v.name, v.uid)))
              concatMap(next => this.allTags$)
          )
          .subscribe(
              next => {
                const newTag = next.filter(tag => tag.name === value)[0];
                if (newTag) {
                  this.filteredTags$ = this.initFilteredTags();

                }
              });

    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tagCtrl.setValue(null);
  }


  dragEnd($event: CdkDragEnd<any>): void {
    $event.source._dragRef.reset();
  }

  createTag(): void {
    const tagName = this.tagInput.nativeElement.value;

    if ((tagName || '').trim()) {
      this.tagService.createTag(tagName)
          .pipe(
              // concatMap(next => this.tagService.loadTags()),
              // map(res => res.map(v => new Tag(v.name, v.uid)))
              concatMap(next => this.allTags$)
          )
          .subscribe(
              next => {
                const newTag = next.filter(tag => tag.name === tagName)[0];
                if (newTag) {
                  this.filteredTags$ = of([newTag]);
                }
              });

    }
  }

}
