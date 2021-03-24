export enum MetaDataType {
    MetaNumberValue= 2,
    MetaDateValue= 3,
    MetaBooleanValue= 4,
    MetaText= 1,
    MetaMultiValuedText= 5
}

export const MetaDataTypeMapping = {
    1 : 'Text',
    5 : 'Multivalued text',
    3 : 'Date',
    4 : 'Boolean',
    2 : 'Number'
};
