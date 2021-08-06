import {Folder, Workspace} from 'app/kimios-client-api';

export interface SearchEntityQuery {
    name: string;
    id: number;
    content: string;
    owner: string;
    folder: Folder | Workspace;
    tags: Array<string>;
    dateMin: Date;
    dateMax: Date;
}
