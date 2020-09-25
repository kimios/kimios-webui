import {FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

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
