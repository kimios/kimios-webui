export class MetaValueRange {
    min: any;
    max: any;

    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    public isEmpty(): boolean {
        return (this.min == null || this.min === undefined)
        && (this.max == null || this.max === undefined);
    }
}

export class MetaValueRangeNumber extends MetaValueRange {
    min: number;
    max: number;
}

export class MetaValueRangeDate extends MetaValueRange {
    min: Date;
    max: Date;
}
