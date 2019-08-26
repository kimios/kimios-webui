import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipEvent, MatDialogRef} from '@angular/material';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CdkDragDrop, CdkDragEnter, CdkDragExit} from '@angular/cdk/drag-drop';
import {Tag} from 'app/main/model/tag';
import {BehaviorSubject} from 'rxjs';

export interface DialogData {
    filesList: File[];
    filesTags: Map<string, Map<number, Tag>>;
}

@Component({
    selector: 'app-files-upload-dialog',
    templateUrl: './files-upload-dialog.component.html',
    styleUrls: ['./files-upload-dialog.component.scss']
})
export class FilesUploadDialogComponent {
    form: FormGroup;
    private _fileIds: string[];
    filesTags$: Map<string, BehaviorSubject<Array<Tag>>>;

    constructor(
        public dialogRef: MatDialogRef<FilesUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private formBuilder: FormBuilder) {

        this.form = this.formBuilder.group({
            filesList: new FormArray([])
        });
        this.filesTags$ = new Map<string, BehaviorSubject<Array<Tag>>>();
        this.addCheckboxes();
    }

    private addCheckboxes(): void {
        this.data.filesList.map((o, i) => {
            const control = new FormControl(1);
            (this.form.controls.filesList as FormArray).push(control);
            this.data.filesTags.set(o.name, new Map<number, Tag>());
            this.filesTags$.set(o.name, new BehaviorSubject<Array<Tag>>([]));
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
        if ($event.item.data instanceof Tag) {
            this.data.filesTags.get(targetFileName).set($event.item.data.uid, $event.item.data);
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
            && $event.chip._elementRef.nativeElement.dataset.tagid
            && $event.chip._elementRef.nativeElement.dataset.filename) {
            const fileName = $event.chip._elementRef.nativeElement.dataset.filename;
            this.data.filesTags
                .get(fileName)
                .delete(Number($event.chip._elementRef.nativeElement.dataset.tagid));
            this.filesTags$
                .get(fileName)
                .next(Array.from(this.data.filesTags
                    .get(fileName).values())
                );
            console.log(this.filesTags$);
        }
    }
}
