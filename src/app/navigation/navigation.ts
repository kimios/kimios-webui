import {FuseNavigation} from '@fuse/types';

export const navigation: FuseNavigation[] = [

    {
        id: 'overview',
        title: 'Overview',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'view_comfy',
        url: '/overview',
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    },
    {
        id: 'workspaces',
        title: 'Workspaces',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'folder',
        url: '/workspaces', // browse without the search bar
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    },
    {
        id: 'myBookmarks',
        title: 'My Bookmarks',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'bookmarks',
        url: '/mybookmarks',
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    },
    {
        id: 'shares',
        title: 'Shares',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'share',
        url: '/shares',
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    },
    {
        id: 'searchQueries',
        title: 'Search Queries',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'search',
        url: '/searchqueries',
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    },
    {
        id: 'settings',
        title: 'Settings',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'settings',
        url: '/settings',
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    }
];
