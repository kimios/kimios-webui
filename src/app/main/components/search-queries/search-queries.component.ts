import { Component, OnInit } from '@angular/core';
import {SearchEntityService} from 'app/services/searchentity.service';

@Component({
  selector: 'app-search-queries',
  templateUrl: './search-queries.component.html',
  styleUrls: ['./search-queries.component.scss']
})
export class SearchQueriesComponent implements OnInit {

  allTags: Map<string, number>;

  constructor(
      private searchEntityService: SearchEntityService
  ) {

  }

  ngOnInit(): void {
    this.searchEntityService.retrieveAllTags().subscribe(
        res => this.allTags = res
    );
  }

}
