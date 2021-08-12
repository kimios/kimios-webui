export class MetaValueRange {
    min: number | Date;
    max: number | Date;

    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
}
