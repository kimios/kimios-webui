import { Injectable } from '@angular/core';
import {DocumentUpload} from 'app/main/model/document-upload';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  uploadList: Map<string, DocumentUpload>;

  uploadCreated: BehaviorSubject<string>;

  constructor() {
    this.uploadCreated = new BehaviorSubject<string>('');
  }

  createUpload(fileName: string, filePath: string): void {
    const upload = new DocumentUpload(fileName, filePath);
    this.uploadList.set(upload.id, upload);
    this.uploadCreated.next(upload.id);
  }
}
