import {ColumnDescription} from './column-description';

export interface ColumnDescriptionWithElement extends ColumnDescription {
    element: 'span' | 'checkbox' | 'iconName' | 'iconFunction';
    class: undefined | string;
    cellHeaderIcon?: string;
}
