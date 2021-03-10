export enum DocumentUploadStatus {
    CREATED= 0,
    ONGOING= 1,
    ERROR= 2,
    SUCCESSFUL= 3
}

export class DocumentUpload {
    private _id: string;
    private _percentage: number;
    private _message: string;
    private _error: string;
    private _documentName: string;
    private _documentPath: string;
    private _status: DocumentUploadStatus;
    private _documentId: number;

    constructor(documentName: string, documentPath: string) {
        this._documentName = documentName;
        this._documentPath = documentPath;
        this._percentage = -1;
        this._status = DocumentUploadStatus.CREATED;
        this._id = this._documentPath + '/' + this._documentName;
    }

    get percentage(): number {
        return this._percentage;
    }

    set percentage(value: number) {
        this._percentage = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }

    get error(): string {
        return this._error;
    }

    set error(value: string) {
        this._error = value;
    }

    get documentName(): string {
        return this._documentName;
    }

    get documentPath(): string {
        return this._documentPath;
    }

    get id(): string {
        return this._id;
    }

    get status(): DocumentUploadStatus {
        return this._status;
    }

    set status(value: DocumentUploadStatus) {
        this._status = value;
    }

    isOnGoing(): boolean {
        return this.status === DocumentUploadStatus.ONGOING;
    }

    isError(): boolean {
        return this.status === DocumentUploadStatus.ERROR;
    }

    isSuccessful(): boolean {
        return this.status === DocumentUploadStatus.SUCCESSFUL;
    }

    get documentId(): number {
        return this._documentId;
    }

    set documentId(value: number) {
        this._documentId = value;
    }
}
