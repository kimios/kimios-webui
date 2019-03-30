import {FuseNavigation} from '@fuse/types';

export const navigation: FuseNavigation[] = [

    {
        id: 'documents',
        title: 'My Documents',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'file',
        url: '/files',
        badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }
    }
];
