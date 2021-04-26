export interface DMEntitySort {
    name: string;
    direction: 'asc' | 'desc';
    type?: 'string' | 'number' | 'DMEntity' | 'external';
    externalSortData?: Map<any, any>;
}
