import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {from, Observable, of} from 'rxjs';
import {TagService} from '../../../services/tag.service';
import {SearchEntityService} from '../../../services/searchentity.service';
import {concatMap, flatMap, map} from 'rxjs/operators';
import {Criteria} from '../../../kimios-client-api';

@Component({
  selector: 'file-search',
  templateUrl: './file-search.component.html',
  styleUrls: ['./file-search.component.scss']
})
export class FileSearchComponent implements OnInit {

  searchInputCtrl = new FormControl();
  filenames$: Observable<string>;
  terms$: Observable<string>;
  filteredTags$: Observable<{ uid: number; name: string; count: number }[]>;
  filteredTags: Map<number, { uid: number; name: string; count: number }>;
  filteredTagsWithCount$: Observable<Array<{name: string, count: number}>>;
  searchTagCtrl = new FormControl();

  constructor(
      private tagService: TagService,
      private searchEntityService: SearchEntityService,
  ) {
      this.searchEntityService.onTagsDataChanged.subscribe(
          (res) => {
              res.forEach(val => {
                  val.name = val.name.toLocaleUpperCase().replace(new RegExp('^' + TagService.TAG_NAME_PREFIX), '');
              });
              this.filteredTags$ = of(res);
              console.log('received tags');
              console.dir(res);
          }
      );
  }

  ngOnInit(): void {

  }

  search(term: string): void {

  }
}
