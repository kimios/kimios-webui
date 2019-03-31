import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileManagerComponent} from './file-manager.component';

import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatIconModule, MatRippleModule, MatSlideToggleModule, MatSortModule, MatTableModule } from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';



import { EntityService } from 'app/services/entity.service';
import { FileManagerDetailsSidebarComponent } from 'app/main/file-manager/sidebars/details/details.component';
import { FileManagerFileListComponent } from 'app/main/file-manager/file-list/file-list.component';
import { FileManagerMainSidebarComponent } from 'app/main/file-manager/sidebars/main/main.component';


@NgModule({
    declarations: [
        FileManagerComponent,
        FileManagerFileListComponent,
        FileManagerMainSidebarComponent,
        FileManagerDetailsSidebarComponent
    ],
    imports     : [

        MatButtonModule,
        MatIconModule,
        MatRippleModule,
        MatSlideToggleModule,
        MatTableModule,
        CommonModule,
        MatSortModule,

        FuseSharedModule,
        FuseSidebarModule
    ],
    providers   : [
        EntityService
    ]
})
export class FileManagerModule { }
