import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'document-upload-progress',
  templateUrl: './document-upload-progress.component.html',
  styleUrls: ['./document-upload-progress.component.scss']
})
export class DocumentUploadProgressComponent implements OnInit {

  @Input()
  uploadId: string;

  constructor() { }

  ngOnInit(): void {
  }

}
