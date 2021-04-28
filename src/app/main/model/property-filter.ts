export abstract class PropertyFilter {
    propertyName: string;

    constructor(propName: string) {
        this.propertyName = propName;
    }

    abstract applyFilter(value: any): boolean;
}
