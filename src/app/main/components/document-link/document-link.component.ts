import {Component, Input, OnInit} from '@angular/core';
import {Document as KimiosDocument} from 'app/kimios-client-api';
import {DocumentUtils} from '../../utils/document-utils';
import {Router} from '@angular/router';
import {BrowseEntityService} from '../../../services/browse-entity.service';

@Component({
  selector: 'document-link',
  templateUrl: './document-link.component.html',
  styleUrls: ['./document-link.component.scss']
})
export class DocumentLinkComponent implements OnInit {

  @Input()
  document: KimiosDocument;

  constructor(
      private router: Router,
      private bes: BrowseEntityService
  ) { }

  ngOnInit(): void {
  }

  navigateToDocument(): void {
    DocumentUtils.navigateToFile(this.router, this.document.uid);
    this.bes.openEntityFromFileUploadList$.next(this.document.uid);
  }
}
