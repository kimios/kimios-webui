export interface ColumnDescription {
    matColumnDef: string;
    id: string;
    position: number;
    matHeaderCellDef: string;
    displayName: string;
    sticky: boolean;
    cell: any;
    noSortHeader?: boolean;
    title?: (any) => string;
}
