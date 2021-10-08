import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'document-meta-data',
  templateUrl: './document-meta-data.component.html',
  styleUrls: ['./document-meta-data.component.scss']
})
export class DocumentMetaDataComponent implements OnInit {

  @Input()
  documentId: number;


  constructor() { }

  ngOnInit(): void {

  }

}
