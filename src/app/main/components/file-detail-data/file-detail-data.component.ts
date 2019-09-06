import {Component, Input, OnInit} from '@angular/core';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {Observable} from 'rxjs';

@Component({
  selector: 'file-detail-data',
  templateUrl: './file-detail-data.component.html',
  styleUrls: ['./file-detail-data.component.scss']
})
export class FileDetailDataComponent implements OnInit {

  @Input()
  document$: Observable<KimiosDocument>;

  constructor() {}

  ngOnInit(): void {
  }

}
