import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatIconModule, MatToolbarModule} from '@angular/material';

import {FuseSharedModule} from '@fuse/shared.module';

import {FooterComponent} from 'app/layout/components/footer/footer.component';
import {FileManagerModule} from 'app/main/file-manager/file-manager.module';

@NgModule({
    declarations: [
        FooterComponent
    ],
    imports     : [
        RouterModule,

        MatButtonModule,
        MatIconModule,
        MatToolbarModule,

        FuseSharedModule,
        FileManagerModule
    ],
    exports     : [
        FooterComponent
    ]
})
export class FooterModule
{
}
