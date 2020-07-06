import {FuseNavigation} from '@fuse/types';

export const navigation: FuseNavigation[] = [

    {
        id: 'overview',
        title: 'Overview',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'file',
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
        icon: 'file',
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
        icon: 'file',
        url: '/mybookmarks',
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    },
    {
        id: 'Shares',
        title: 'shares',
        translate: 'NAV.SAMPLE.TITLE',
        type: 'item',
        icon: 'file',
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
        icon: 'file',
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
        icon: 'file',
        url: '/settings',
        /*badge: {
            title: '1',
            translate: 'NAV.SAMPLE.BADGE',
            bg: '#f41e4a',
            fg: '#FFFFFF'
        }*/
    }
];
