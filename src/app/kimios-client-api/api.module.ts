import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { AdministrationService } from './api/administration.service';
import { ConverterService } from './api/converter.service';
import { DefaultService } from './api/default.service';
import { DocumentService } from './api/document.service';
import { DocumentVersionService } from './api/documentVersion.service';
import { DocumentVersionRestOnlyService } from './api/documentVersionRestOnly.service';
import { EditorsService } from './api/editors.service';
import { FiletransferService } from './api/filetransfer.service';
import { FolderService } from './api/folder.service';
import { InformationService } from './api/information.service';
import { LogService } from './api/log.service';
import { NotificationService } from './api/notification.service';
import { ReportingService } from './api/reporting.service';
import { RuleService } from './api/rule.service';
import { SearchService } from './api/search.service';
import { SecurityService } from './api/security.service';
import { ShareService } from './api/share.service';
import { StudioService } from './api/studio.service';
import { WorkspaceService } from './api/workspace.service';
import { ZipService } from './api/zip.service';
import { ZipRestOnlyService } from './api/zipRestOnly.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    AdministrationService,
    ConverterService,
    DefaultService,
    DocumentService,
    DocumentVersionService,
    DocumentVersionRestOnlyService,
    EditorsService,
    FiletransferService,
    FolderService,
    InformationService,
    LogService,
    NotificationService,
    ReportingService,
    RuleService,
    SearchService,
    SecurityService,
    ShareService,
    StudioService,
    WorkspaceService,
    ZipService,
    ZipRestOnlyService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
