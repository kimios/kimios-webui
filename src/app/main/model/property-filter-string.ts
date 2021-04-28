import {PropertyFilter} from './property-filter';

export class PropertyFilterString extends PropertyFilter {
    propertyValue: string;


    constructor(propName: string, propertyValue: string) {
        super(propName);
        this.propertyValue = propertyValue;
    }

    applyFilter(value: any): boolean {
        return (value as string).toLowerCase().includes(this.propertyValue.toLowerCase());
    }
}
