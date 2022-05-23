import {Injectable} from '@angular/core';
import {DocumentUpload, DocumentUploadStatus} from 'app/main/model/document-upload';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  uploadList: Map<string, DocumentUpload>;

  uploadCreated: BehaviorSubject<string>;
  uploadUpdates: Map<string, BehaviorSubject<DocumentUpload>>;

  constructor() {
    this.uploadList = new Map<string, DocumentUpload>();
    this.uploadCreated = new BehaviorSubject<string>('');
    this.uploadUpdates = new Map<string, BehaviorSubject<DocumentUpload>>();
  }

  createUpload(filePath: string): void {
    const pathSplit = filePath.split('/');
    if (pathSplit.length < 2) {
      return;
    }
    const fileName = pathSplit[pathSplit.length - 1];
    const filePathWithoutName = pathSplit.slice(0, pathSplit.length - 1).join('/');

    const upload = new DocumentUpload(fileName, filePathWithoutName);
    this.uploadList.set(upload.id, upload);
    this.uploadCreated.next(upload.id);
    this.uploadUpdates.set(upload.id, new BehaviorSubject<DocumentUpload>(null));
  }

  updateUploadPercentage(id: string, percentage: number): void {
    this.uploadList.get(id).percentage = percentage;
    this.publishUploadUpdate(this.uploadList.get(id));
  }

  updateUploadStatus(id: string, status: DocumentUploadStatus, docId?: number, message?: string): void {
    this.uploadList.get(id).documentId = docId;
    this.uploadList.get(id).status = status;
    this.uploadList.get(id).message = message;
    this.publishUploadUpdate(this.uploadList.get(id));
  }

  publishUploadUpdate(upload: DocumentUpload): void {
    this.uploadUpdates.get(upload.id).next(upload);
  }
}
