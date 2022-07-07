import {PluginService} from './plugin.service';

export * from './administration.service';
import { AdministrationService } from './administration.service';
export * from './converter.service';
import { ConverterService } from './converter.service';
export * from './default.service';
import { DefaultService } from './default.service';
export * from './document.service';
import { DocumentService } from './document.service';
export * from './documentVersion.service';
import { DocumentVersionService } from './documentVersion.service';
export * from './documentVersionRestOnly.service';
import { DocumentVersionRestOnlyService } from './documentVersionRestOnly.service';
export * from './editors.service';
import { EditorsService } from './editors.service';
export * from './filetransfer.service';
import { FiletransferService } from './filetransfer.service';
export * from './folder.service';
import { FolderService } from './folder.service';
export * from './information.service';
import { InformationService } from './information.service';
export * from './log.service';
import { LogService } from './log.service';
export * from './notification.service';
import { NotificationService } from './notification.service';
export * from './reporting.service';
import { ReportingService } from './reporting.service';
export * from './rule.service';
import { RuleService } from './rule.service';
export * from './search.service';
import { SearchService } from './search.service';
export * from './security.service';
import { SecurityService } from './security.service';
export * from './share.service';
import { ShareService } from './share.service';
export * from './studio.service';
import { StudioService } from './studio.service';
export * from './workspace.service';
import { WorkspaceService } from './workspace.service';
export * from './zip.service';
import { ZipService } from './zip.service';
export * from './zipRestOnly.service';
import { ZipRestOnlyService } from './zipRestOnly.service';
export const APIS = [AdministrationService, ConverterService, DefaultService, DocumentService, DocumentVersionService, DocumentVersionRestOnlyService, EditorsService, FiletransferService, FolderService, InformationService, LogService, NotificationService, PluginService, ReportingService, RuleService, SearchService, SecurityService, ShareService, StudioService, WorkspaceService, ZipService, ZipRestOnlyService];
