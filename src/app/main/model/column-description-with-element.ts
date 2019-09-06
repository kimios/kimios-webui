import {ColumnDescription} from './column-description';
import {DMEntitySecurity} from '../../kimios-client-api';

export interface ColumnDescriptionWithElement extends ColumnDescription {
    element: 'span' | 'checkbox' | 'iconName' | 'iconFunction';
    class: undefined | string;
}
