import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileManagerComponent} from './file-manager.component';
import {MatTableModule} from '@angular/material';

@NgModule({
    declarations: [
        FileManagerComponent
    ],
    imports: [
        CommonModule,
        MatTableModule
    ]
})
export class FileManagerModule { }
