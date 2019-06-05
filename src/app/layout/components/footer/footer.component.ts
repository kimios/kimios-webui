import { Component } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {FileUploadListComponent} from 'app/main/components/file-upload-list/file-upload-list.component';

@Component({
    selector   : 'footer',
    templateUrl: './footer.component.html',
    styleUrls  : ['./footer.component.scss']
})
export class FooterComponent
{
    showFileUploadProgress = true;

    /**
     * Constructor
     */
    constructor(private _bottomSheet: MatBottomSheet) {
    }

    openBottomSheetUploadList(): void {
        this.showFileUploadProgress = false;
        const bottomSheetRef = this._bottomSheet.open(FileUploadListComponent);
        bottomSheetRef.afterDismissed().subscribe(
            next => this.showFileUploadProgress = true
        );
    }
}
