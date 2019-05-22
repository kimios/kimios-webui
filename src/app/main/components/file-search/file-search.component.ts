import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Observable, of, pipe} from 'rxjs';
import {TagService} from '../../../services/tag.service';
import {SearchEntityService} from '../../../services/searchentity.service';
import {map, startWith, tap} from 'rxjs/operators';
import {Tag} from 'app/main/model/tag';

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
    searchParams = this.fb.group({
        content: '',
        tagList: this.fb.array([]),
        filename: ''
    }, {
        validators: searchParamsValidator
    });

    tagFilter = new FormControl('');

    filenames$: Observable<string>;
    terms$: Observable<string>;
    tags$: Observable<Tag[]>;
    tags: Tag[];
    filteredTags$: Observable<Tag[]>;
    filteredTags: Map<number, { uid: number; name: string; count: number }>;
    filteredTagsWithCount$: Observable<Array<{name: string, count: number}>>;
    selectedTags$: Observable<Tag[]>;

    visible = true;
    selectable = true;
    removable = true;

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
                this.filteredTags$ = this.tags$;
                this.tags = res;
                console.log('received tags');
                console.dir(res);
            }
        );
    }

    ngOnInit(): void {
        this.filteredTags$ = this.tagFilter.valueChanges
            .pipe(
                startWith<string>(''),
                tap(value => console.log('value : ' + value)),
                map(value => value ? this._filterTags(value) : this.tags.slice())
            );
        this.selectedTags$ = this.searchParams.get('tagList').valueChanges
            .pipe(
                map(value => value)
            );

        // this.selectedTags$.subscribe(value => this.filteredTags$ = this.filteredTags$.pipe(
        //     map(list => list.filter(t => value.includes(t))))
        // );
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
                this.searchParams.get('tagList').value
            );
        }
    }

    displayTag(tag?: { uid: number; name: string; count: number }): string | undefined {
        return tag ? tag.name : undefined;
    }

    selectTag(tag: Tag): void {
        const tagsFormArray = this.searchParams.get('tagList') as FormArray;
        tagsFormArray.push(this.createFormArrayTag(tag));
    }

    removeTag(tag: Tag): void {
        const tagsFormArray = this.searchParams.get('tagList') as FormArray;
        let index = -1;
        tagsFormArray.getRawValue().forEach((e, i) => {
            if (e.uid === tag.uid) {
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
}
