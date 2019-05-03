import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';

export interface DialogData {
    filesList: File[];
}

@Component({
    selector: 'app-files-upload-dialog',
    templateUrl: './files-upload-dialog.component.html',
    styleUrls: ['./files-upload-dialog.component.scss']
})
export class FilesUploadDialogComponent {
    form: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<FilesUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private formBuilder: FormBuilder) {

        this.form = this.formBuilder.group({
            filesList: new FormArray([])
        });
        this.addCheckboxes();
    }

    private addCheckboxes(): void {
        this.data.filesList.map((o, i) => {
            const control = new FormControl(1);
            (this.form.controls.filesList as FormArray).push(control);
        });
    }

    submit(): void {
//        let fileToUpload = new Array<File>();
        const fileToUpload = this.data.filesList
            .filter((elem, i) => this.form.controls.filesList.controls[i].value === 1);
        this.data.filesList = fileToUpload;
        this.dialogRef.close();
    }

    onNoClick(): void {
        this.data.filesList = [];
        this.dialogRef.close();
    }
}
