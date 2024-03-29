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
  uploadFinished: BehaviorSubject<DocumentUpload>;

  constructor() {
    this.uploadList = new Map<string, DocumentUpload>();
    this.uploadCreated = new BehaviorSubject<string>('');
    this.uploadUpdates = new Map<string, BehaviorSubject<DocumentUpload>>();
    this.uploadFinished = new BehaviorSubject<DocumentUpload>(null);
  }

  createUpload(filePath: string): string {
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

    return upload.id;
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
    if (upload.isSuccessful() || upload.isError()) {
      this.uploadFinished.next(upload);
    }
  }

  getNbUploadOnError(): number {
    return Array.from(this.uploadList.values()).filter(upload => upload.isError()).length;
  }

  getNbUploadOnSuccess(): number {
    return Array.from(this.uploadList.values()).filter(upload => upload.isSuccessful()).length;
  }
}
