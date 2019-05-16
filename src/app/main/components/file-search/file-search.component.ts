import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {TagService} from '../../../services/tag.service';

@Component({
  selector: 'file-search',
  templateUrl: './file-search.component.html',
  styleUrls: ['./file-search.component.scss']
})
export class FileSearchComponent implements OnInit {

  searchInputCtrl = new FormControl();
  filenames$: Observable<string>;
  terms$: Observable<string>;
  filteredTags$: Observable<string[]>;
  searchTagCtrl = new FormControl();

  constructor(private tagService: TagService) {
    this.filteredTags$ = this.tagService.tags$;
  }

  ngOnInit(): void {
    this.filteredTags$.subscribe();
  }

  search(term: string): void {

  }

}
