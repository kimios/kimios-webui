import {ColumnDescription} from './column-description';

export interface ColumnDescriptionWithElement extends ColumnDescription {
    element: 'span' | 'checkbox' | 'icon';
    class: undefined | string;
}
