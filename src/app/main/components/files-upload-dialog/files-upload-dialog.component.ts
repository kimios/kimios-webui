import {AfterViewInit, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipEvent, MatChipInputEvent, MatDialogRef} from '@angular/material';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CdkDragDrop, CdkDragEnter, CdkDragExit} from '@angular/cdk/drag-drop';
import {Tag} from 'app/main/model/tag';
import {BehaviorSubject} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

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
    filesTags: Map<string, Array<string>>;
    dirsPath: Array<string>;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    addOnBlur = false;
    fileIdsMap = new Map<string, string>();

    @ViewChildren('tagInput') tagInputs: QueryList<ElementRef<HTMLInputElement>>;

    constructor(
        public dialogRef: MatDialogRef<FilesUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private formBuilder: FormBuilder) {

        this.form = this.formBuilder.group({
            'filesList': this.formBuilder.group({})
        });
        this.filesTags$ = new Map<string, BehaviorSubject<Array<string>>>();
        this.filesTags = new Map<string, Array<string>>();
    }

    ngOnInit(): void {
        this.data.filesList.forEach((filesArray, path) => {
            if (filesArray.length === 0) {
                this.data.filesList.delete(path);
                return;
            }
            filesArray.forEach(file => {
                const completePath = path + '/' + file.name;
                this.fileIdsMap.set(completePath, this.generateUniqueId(completePath));
            });
        });
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
                this.data.filesTags.set(o.name, new Array<string>());
                this.filesTags$.set(o.name, new BehaviorSubject<Array<string>>([]));
                this.filesTags.set(o.name, new Array<string>());
            });
            console.dir(formArray);
            (this.form.get('filesList') as FormGroup).addControl(this.makeKeyFromPathForFormControl(path), formArray);
        });
        console.dir(this.form);
    }

    submit($event: MouseEvent): void {
        $event.stopPropagation();
        $event.preventDefault();

//        let fileToUpload = new Array<File>();
        const fileToUpload = new Map<string, Array<File>>();
        const formCopyFilesList = this.form.get('filesList');
        console.dir(formCopyFilesList);
        console.dir(this.data.filesList);
        this.data.filesList.forEach((filesArray, path) => {
            fileToUpload.set(path, filesArray.filter((elem, i) =>
                (formCopyFilesList.get(this.makeKeyFromPathForFormControl(path)) as FormArray).at(i).value === 1));
        });
        this.data.filesList = fileToUpload;
        Array.from(this.filesTags$.keys()).forEach(fileName =>
            this.data.filesTags.set(fileName, this.filesTags$.get(fileName).getValue()));
        this.dialogRef.close(true);
    }

    onNoClick($event: MouseEvent): void {
        $event.stopPropagation();
        $event.preventDefault();

        this.data.filesList = new Map<string, Array<File>>();
        this.dialogRef.close(false);
    }

    addTag($event: MatChipInputEvent, name: string, inputId: string): void {
        if (typeof $event.value === 'string' && $event.value.trim().length > 0) {
            const tags = this.filesTags$.get(name).getValue();
            if (! tags.includes($event.value)) {
                tags.push($event.value);
                this.filesTags$.get(name).next(tags);
            }
            this.tagInputs.filter(item => item.nativeElement.id === inputId)[0].nativeElement.value = '';
        }
    }

    dragOver($event: CdkDragEnter<any>): void {
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

    removeTag(tag: string, name: string): void {
        if (typeof tag === 'string') {
            const tags = this.filesTags$.get(name).getValue();
            const tagIndex = tags.indexOf(tag);
            if (tagIndex !== -1) {
                tags.splice(tagIndex, 1);
                this.filesTags$.get(name).next(tags.filter(v => v !== tag));
            }
        }
    }

    makeKeyFromPathForFormControl(path: string): string {
        return path.split('/').join(pathDirSeparator)
            .split('.').join(pathPointReplacement);
    }

    makePathFromFormControlKey(key: string): string {
        return key.split(pathDirSeparator).join('/');
    }

    private generateUniqueId(str: string): string {
        return btoa(escape(str));
    }
}
