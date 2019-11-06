import {DataSource} from '@angular/cdk/table';
import {SearchEntityService} from 'app/services/searchentity.service';
import {Observable} from 'rxjs';

export class FilesDataSource extends DataSource<any>
{
    /**
     * Constructor
     *
     * @param {FileManagerService} _fileManagerService
     */
    constructor(
        private _fileManagerService: SearchEntityService
    )
    {
        super();
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        return this._fileManagerService.onFilesChanged;
    }

    /**
     * Disconnect
     */
    disconnect(): void
    {
    }

    loadDocuments(sortField: string, sortDir, page: number): void {
        this._fileManagerService.changeSort(sortField, sortDir, page).subscribe();
    }
}
