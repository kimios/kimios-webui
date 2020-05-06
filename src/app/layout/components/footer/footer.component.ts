import {Component, OnInit} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {FileUploadListComponent} from 'app/main/components/file-upload-list/file-upload-list.component';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {takeWhile} from 'rxjs/operators';

@Component({
    selector   : 'footer',
    templateUrl: './footer.component.html',
    styleUrls  : ['./footer.component.scss']
})
export class FooterComponent implements OnInit
{
    showFileUploadProgress = true;
    private subscriptionOk = true;
    private bottomSheetRef: MatBottomSheetRef<FileUploadListComponent, any>;

    /**
     * Constructor
     */
    constructor(
        private _bottomSheet: MatBottomSheet,
        private browseEntityService: BrowseEntityService
    ) {
    }

    ngOnInit(): void {
        this.browseEntityService.openEntityFromFileUploadList$.pipe(
            takeWhile(next => this.subscriptionOk),
        ).subscribe(
            next => this.bottomSheetRef.dismiss()
        );
    }

    openBottomSheetUploadList(): void {
        this.showFileUploadProgress = false;
        this.bottomSheetRef = this._bottomSheet.open(FileUploadListComponent);
        this.bottomSheetRef.afterDismissed().subscribe(
            next => this.showFileUploadProgress = true
        );
    }
}
