import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'share-external',
  templateUrl: './share-external.component.html',
  styleUrls: ['./share-external.component.scss']
})
export class ShareExternalComponent implements OnInit {

  @Input()
  documentId: number;
  @Input()
  documentName: string;

  constructor() { }

  ngOnInit(): void {
  }

}
