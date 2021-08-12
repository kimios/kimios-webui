export class MetaValueRange {
    min: number | Date;
    max: number | Date;

    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    public isEmpty(): boolean {
        return (this.min == null || this.min === undefined)
        && (this.max == null || this.max === undefined);
    }
}
