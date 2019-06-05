import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {TagService} from '../../../services/tag.service';
import {SearchEntityService} from '../../../services/searchentity.service';
import {map, startWith} from 'rxjs/operators';
import {Tag} from 'app/main/model/tag';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent} from '@angular/material';

export const searchParamsValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const content = control.get('content');
    const filename = control.get('filename');
    const tagList = control.get('tagList');

    return (
        content
        && filename
        && tagList
        && content.value === ''
        && filename.value === ''
        && tagList.value instanceof Array
        && tagList.value.length === 0
    ) ? { 'searchParamsValid': false } : null;
};

@Component({
  selector: 'file-search',
  templateUrl: './file-search.component.html',
  styleUrls: ['./file-search.component.scss']
})
export class FileSearchComponent implements OnInit {
    searchParams: FormGroup;

    tagFilter = new FormControl('');

    filenames$: Observable<string>;
    terms$: Observable<string>;
    tags$: Observable<Tag[]>;
    tags: Tag[];
    filteredTags$: Observable<Tag[]>;
    filteredTags: Tag[];
    filteredTagsWithCount$: Observable<Array<{name: string, count: number}>>;
    selectedTag$: Subject<Tag>;
    deselectedTag$: Subject<Tag>;
    selectedTags: Tag[];

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;

    separatorKeysCodes: number[] = [ENTER, COMMA];
    tagCtrl = new FormControl();

    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(
        private tagService: TagService,
        private searchEntityService: SearchEntityService,
        private fb: FormBuilder
    ) {
        this.searchEntityService.onTagsDataChanged.subscribe(
            (res) => {
                res.forEach(val => {
                    val.name = val.name.toLocaleUpperCase().replace(new RegExp('^' + TagService.TAG_NAME_PREFIX), '');
                });
                this.tags$ = of(res);
                // this.filteredTags$ = this.tags$;
                this.tags = res;
                this.tagCtrl.updateValueAndValidity();
                console.log('received tags');
                console.dir(res);
            }
        );
        this.selectedTags = new Array<Tag>();
        this.selectedTag$ = new Subject<Tag>();
        this.deselectedTag$ = new Subject<Tag>();
        this.searchParams = this.fb.group({
            content: '',
            tagList: this.fb.array([''
                // this.fb.control('')
            ]),
            filename: ''
        }, {
            validators: searchParamsValidator
        });
    }

    ngOnInit(): void {
        // this.filteredTags$ = this.tagCtrl.valueChanges
        //     .pipe(
        //         startWith<string>(''),
        //         tap(value => console.log('value : ' + value)),
        //         map(value => value ? this._filterTags(value) : this.tags.slice())
        //     );
        // this.searchParams.get('tagList').valueChanges
        //     .pipe(
        //         tap(value => { console.log('value : '); console.log(value); }),
        //         map(value => value)
        //     ).subscribe(
        //         res => this.selectedTags$ = of(res)
        // );

        this.filteredTags$ = this.tagCtrl.valueChanges.pipe(
            startWith(null),
            map((tag: (string|Tag) | null) =>
                tag ?
                    this._filterTags(tag instanceof Tag ? tag.name : tag) :
                    this.tags.slice()));

        // this.selectedTags$.subscribe(value => this.filteredTags$ = this.filteredTags$.pipe(
        //     map(list => list.filter(t => value.includes(t))))
        // );

        this.selectedTag$.subscribe(
            (res) => {
                this.selectedTags.push(res);
                (this.searchParams.get('tagList') as FormArray).push(this.createFormArrayTag(res));
            }
        );
        this.deselectedTag$.subscribe(
            (res) => {
                const index = this.selectedTags.indexOf(res);
                if (index >= 0) {
                    this.selectedTags.splice(index, 1);
                }
            }
        );
    }

    private _filterTags(value: string): Tag[] {
        const filterValue = value.toLowerCase();

        return this.tags.filter(tag => tag.name.toLowerCase().includes(filterValue));
    }

    onSubmit(): void {
        console.log(this.searchParams.errors);

        this.searchParams.updateValueAndValidity();

        if (this.searchParams.errors === null
            || this.searchParams.errors['searchParamsValid'] === null) {
            this.searchEntityService.searchWithFilters(
                this.searchParams.get('content').value,
                this.searchParams.get('filename').value,
                (this.searchParams.get('tagList') as FormArray).getRawValue().filter(e => e !== '')
            );
        }
    }

    displayTag(tag?: Tag): string | undefined {
        return tag ? (tag.name + ' (' + tag.count + ')') : undefined;
    }

    selectTag(tag: Tag): void {
        (this.searchParams.get('tagList') as FormArray).push(this.createFormArrayTag(tag));
        // tagsFormArray.push(this.createFormArrayTag(tag));
        // this.searchParams.get('tagList').setValue(tagsFormArray.getRawValue());
        // this.searchParams.updateValueAndValidity();
    }

    deselectTag(tag: Tag): void {
        this.deselectedTag$.next(tag);

        const tagsFormArray = this.searchParams.get('tagList') as FormArray;
        let index = -1;
        tagsFormArray.getRawValue().forEach((e, i) => {
            if (e['_uid'] === tag.uid) {
                index = i;
            }
        });
        if (index !== -1) {
            tagsFormArray.removeAt(index);
        }
    }

    createFormArrayTag(tag: Tag): FormGroup {
        return this.fb.group(tag);
    }

    addTag(event: MatChipInputEvent): void {
        if (!this.matAutocomplete.isOpen) {
            const input = event.input;
            const value = event.value;

            // Add our fruit
            if ((value || '').trim()) {
                this.selectedTags.push(this.tags.filter(t => t.uid === +value.trim())[0]);
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.tagCtrl.setValue(null);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        const tag: any = event.option.value;
        if (this.selectedTags.filter(t => t.uid === tag.uid).length === 0) {
            this.selectedTag$.next(tag);
        }
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

}
