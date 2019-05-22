import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {TagService} from '../../../services/tag.service';
import {SearchEntityService} from '../../../services/searchentity.service';
import {map, startWith} from 'rxjs/operators';
import {Tag} from 'app/main/model/tag';

export const searchParamsValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const content = control.get('content');
    const filename = control.get('filename');
    const tag = control.get('tag');

    return (
        content
        && filename
        && tag
        && content.value === ''
        && filename.value === ''
        && tag.value.uid === -1
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
        tag: new Tag('', -1),
        filename: ''
    }, {
        validators: searchParamsValidator
    });

    filenames$: Observable<string>;
    terms$: Observable<string>;
    tags$: Observable<{ uid: number; name: string; count: number }[]>;
    tags: { uid: number; name: string; count: number }[];
    filteredTags$: Observable<{ uid: number; name: string; count: number }[]>;
    filteredTags: Map<number, { uid: number; name: string; count: number }>;
    filteredTagsWithCount$: Observable<Array<{name: string, count: number}>>;

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
        this.filteredTags$ = this.searchParams.get('tag').valueChanges
            .pipe(
                startWith<string | Tag>(''),
                map(value => typeof value === 'string' ? value : value.name),
                map(name => name ? this._filterTags(name) : this.tags.slice())
            );
    }

    private _filterTags(value: string): { uid: number; name: string; count: number }[] {
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
                this.searchParams.get('tag').value
            );
        }
    }

    displayTag(tag?: { uid: number; name: string; count: number }): string | undefined {
        return tag ? tag.name : undefined;
    }
}
