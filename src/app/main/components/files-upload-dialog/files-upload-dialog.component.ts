import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipEvent, MatDialogRef} from '@angular/material';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CdkDragDrop, CdkDragEnter, CdkDragExit} from '@angular/cdk/drag-drop';
import {Tag} from 'app/main/model/tag';
import {BehaviorSubject} from 'rxjs';

export interface DialogData {
    filesList: Map<string, Array<File>>;
    filesTags: Map<string, Array<string>>;
    dirsToCreate: Array<string>;
}

const pathDirSeparator = '##|##';
const pathPointReplacement = '@@|@@';

@Component({
    selector: 'app-files-upload-dialog',
    templateUrl: './files-upload-dialog.component.html',
    styleUrls: ['./files-upload-dialog.component.scss']
})
export class FilesUploadDialogComponent implements OnInit {

    form: FormGroup;
    private _fileIds: string[];
    filesTags$: Map<string, BehaviorSubject<Array<string>>>;
    dirsPath: Array<string>;

    constructor(
        public dialogRef: MatDialogRef<FilesUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private formBuilder: FormBuilder) {

        this.form = this.formBuilder.group({
            'filesList': this.formBuilder.group({})
        });
        this.filesTags$ = new Map<string, BehaviorSubject<Array<string>>>();
    }

    ngOnInit(): void {
        this.addCheckboxes();
        this.dirsPath = Array.from(this.data.filesList.keys());
    }

    private addCheckboxes(): void {
        this.data.filesList.forEach((filesArray, path) => {
            if (filesArray.length === 0) {
                this.data.filesList.delete(path);
                return;
            }
            console.dir(filesArray);
            const formArray = this.formBuilder.array([]);
            filesArray.forEach((o, i) => {
                const control = new FormControl(1);
                formArray.push(control);
                console.log(formArray.controls.length);
                this.data.filesTags.set(o.name, new Array<string>());
                this.filesTags$.set(o.name, new BehaviorSubject<Array<string>>([]));
            });
            console.dir(formArray);
            (this.form.get('filesList') as FormGroup).addControl(this.makeKeyFromPathForFormControl(path), formArray);
        });
        console.dir(this.form);
    }

    submit(): void {
//        let fileToUpload = new Array<File>();
        const fileToUpload = new Map<string, Array<File>>();
        const formCopyFilesList = this.form.get('filesList');
        console.dir(formCopyFilesList);
        console.dir(this.data.filesList);
        this.data.filesList.forEach((filesArray, path) => {
            console.log(path);
            console.log(this.makeKeyFromPathForFormControl(path));
            console.log(formCopyFilesList.get(this.makeKeyFromPathForFormControl(path)));
            fileToUpload.set(path, filesArray.filter((elem, i) =>
                (formCopyFilesList.get(this.makeKeyFromPathForFormControl(path)) as FormArray).at(i).value === 1));
        });
        this.data.filesList = fileToUpload;
        this.dialogRef.close(true);
    }

    onNoClick(): void {
        this.data.filesList = new Map<string, Array<File>>();
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
        let fileIds = new Array<string>();
        this.data.filesList.forEach(filesArray => fileIds = fileIds.concat(filesArray.map(file => file.name)));

        return fileIds;
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

    makeKeyFromPathForFormControl(path: string): string {
        return path.split('/').join(pathDirSeparator)
            .split('.').join(pathPointReplacement);
    }

    makePathFromFormControlKey(key: string): string {
        return key.split(pathDirSeparator).join('/');
    }
}
