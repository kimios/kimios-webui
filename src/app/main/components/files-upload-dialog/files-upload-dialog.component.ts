import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipEvent, MatDialogRef} from '@angular/material';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CdkDragDrop, CdkDragEnter, CdkDragExit} from '@angular/cdk/drag-drop';
import {Tag} from 'app/main/model/tag';
import {BehaviorSubject} from 'rxjs';

export interface DialogData {
    filesList: File[];
    filesTags: Map<string, Array<string>>;
}

@Component({
    selector: 'app-files-upload-dialog',
    templateUrl: './files-upload-dialog.component.html',
    styleUrls: ['./files-upload-dialog.component.scss']
})
export class FilesUploadDialogComponent {
    form: FormGroup;
    private _fileIds: string[];
    filesTags$: Map<string, BehaviorSubject<Array<string>>>;

    constructor(
        public dialogRef: MatDialogRef<FilesUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private formBuilder: FormBuilder) {

        this.form = this.formBuilder.group({
            filesList: new FormArray([])
        });
        this.filesTags$ = new Map<string, BehaviorSubject<Array<string>>>();
        this.addCheckboxes();
    }

    private addCheckboxes(): void {
        this.data.filesList.map((o, i) => {
            const control = new FormControl(1);
            (this.form.controls.filesList as FormArray).push(control);
            this.data.filesTags.set(o.name, new Array<string>());
            this.filesTags$.set(o.name, new BehaviorSubject<Array<string>>([]));
        });
    }

    submit(): void {
//        let fileToUpload = new Array<File>();
        const fileToUpload = this.data.filesList
            .filter((elem, i) => this.form.controls.filesList['controls'][i].value === 1);
        this.data.filesList = fileToUpload;
        this.dialogRef.close(true);
    }

    onNoClick(): void {
        this.data.filesList = [];
        this.dialogRef.close(false);
    }

    addTag($event: CdkDragDrop<any>): void {
        console.log('add tag');
        console.log($event);
        $event.container.element.nativeElement.classList.remove('dragover');
        const targetFileName = $event.container.id;
        if (typeof $event.item.data === 'string') {
            this.data.filesTags.get(targetFileName).push($event.item.data);

            this.filesTags$.get(targetFileName).next(Array.from(this.data.filesTags.get(targetFileName).values()));
        }
    }

    dragOver($event: CdkDragEnter<any>): void {
        console.log('dragover');
        $event.container.element.nativeElement.classList.add('dragover');
    }

    get fileIds(): string[] {
        return this.data.filesList.map(file => file.name);
    }

    dragExit($event: CdkDragExit<any>): void {
        $event.container.element.nativeElement.classList.remove('dragover');
    }

    removeTag($event: MatChipEvent): void {
        if ($event.chip._elementRef.nativeElement.dataset
            && $event.chip._elementRef.nativeElement.dataset.tagvalue
            && $event.chip._elementRef.nativeElement.dataset.filename) {
            const fileName = $event.chip._elementRef.nativeElement.dataset.filename;
            const index = this.data.filesTags
                .get(fileName)
                .indexOf($event.chip._elementRef.nativeElement.dataset.tagvalue);
            if (index !== -1) {
                this.data.filesTags.get(fileName).splice(index, 1);
            }
            this.filesTags$
                .get(fileName)
                .next(this.data.filesTags.get(fileName));
            console.log(this.filesTags$);
        }
    }
}
