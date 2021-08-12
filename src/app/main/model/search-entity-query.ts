import {DocumentType as KimiosDocumentType, Folder, Workspace} from 'app/kimios-client-api';
import {MetaWithValue} from './meta-with-value';

export interface SearchEntityQuery {
    name: string;
    id: number;
    content: string;
    owner: string;
    folder: Folder | Workspace;
    tags: Array<string>;
    dateMin: Date;
    dateMax: Date;
    documentType: KimiosDocumentType;
    metas: Array<MetaWithValue>;
}
