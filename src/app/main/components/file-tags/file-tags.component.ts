import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {CdkDragEnd, CdkDragStart} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';
import {SearchEntityService} from '../../../services/searchentity.service';

@Component({
  selector: 'file-tags',
  templateUrl: './file-tags.component.html',
  styleUrls: ['./file-tags.component.scss']
})
export class FileTagsComponent implements OnInit {

  allTags$: Observable<string[]>;
  allTags: string[];
  filteredTags$: Observable<string[]>;
  selectable = true;
  removable = true;
  addOnBlur = true;
  tagCtrl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input()
  cdkDropListConnectedTo_var;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  constructor(
      private searchEntityService: SearchEntityService,
      @Inject(DOCUMENT) document
  ) {
    this.allTags = new Array();
    this.allTags$ = this.searchEntityService.retrieveAllTags().pipe(
        map(res => Array.from(res.keys())),
        tap(res => this.allTags = res)
    );
  }

  ngOnInit(): void {
    this.allTags$.subscribe(
        res => this.filteredTags$ = this.initFilteredTags()
    );

  }

  private initFilteredTags(): Observable<string[]> {
    return this.tagCtrl.valueChanges.pipe(
        startWith(null),
        map((tag: (string) | null) =>
            tag ?
                this._filterTags(tag) :
                this.allTags
                    .slice()
        )
    );
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue));
  }

  dragEnd($event: CdkDragEnd<any>): void {
    $event.source._dragRef.reset();
  }

    dragStart($event: CdkDragStart<any>): void {
        console.log('start drag');
    }
}
