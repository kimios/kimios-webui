import {Component, Input, OnInit} from '@angular/core';
import {Document as KimiosDocument} from 'app/kimios-client-api';

@Component({
  selector: 'file-detail-data-and-tags',
  templateUrl: './file-detail-data-and-tags.component.html',
  styleUrls: ['./file-detail-data-and-tags.component.scss']
})
export class FileDetailDataAndTagsComponent implements OnInit {

  @Input()
  document: KimiosDocument;

  constructor() { }

  ngOnInit(): void {
  }

}
