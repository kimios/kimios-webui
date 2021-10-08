import {DocumentType as KimiosDocumentType} from '../../kimios-client-api';

export class DocumentTypeUtils {
    public static filterDocumentTypes(allDocumentTypes: Array<KimiosDocumentType>, inputVal: string, excludedDocumentType: KimiosDocumentType): Array<KimiosDocumentType> {
        return allDocumentTypes.filter(docType => (
                inputVal == null
                || inputVal === undefined
                || inputVal.trim() === ''
                || docType.name.toLowerCase().includes(inputVal.trim().toLowerCase())
            ) && (
                excludedDocumentType == null
                || excludedDocumentType.name !== docType.name
            )
        );
    }


}
