import {PropertyFilter} from './property-filter';

export class PropertyFilterArray extends PropertyFilter {
    propertyValue: Array<any>;

    constructor(propName: string, propertyValue: Array<any>) {
        super(propName);
        this.propertyValue = propertyValue;
    }

    applyFilter(value: any): boolean {
        return this.propertyValue.includes(value);
    }
}
