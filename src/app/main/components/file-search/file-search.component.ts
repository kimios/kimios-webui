import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';

@Component({
  selector: 'file-search',
  templateUrl: './file-search.component.html',
  styleUrls: ['./file-search.component.scss']
})
export class FileSearchComponent implements OnInit {

  searchInputCtrl = new FormControl();
  filenames$: Observable<string>;
  terms$: Observable<string>;
  filteredTags$: Observable<string>;
  searchTagCtrl = new FormControl();

  constructor() {
    this.filenames$ = this.searchInputCtrl.valueChanges
        .pipe(

        );
  }

  ngOnInit(): void {
  }

  search(term: string): void {

  }

}
