import {DMEntity, Document as KimiosDocument} from 'app/kimios-client-api';
import {IconService} from 'app/services/icon.service';

export enum DMEntityType {
    WORKSPACE = 1,
    FOLDER = 2,
    DOCUMENT = 3
}

export class DMEntityUtils {

    public static dmEntityIsWorkspace(dmEntity: DMEntity): boolean {
        return dmEntity.type === DMEntityType.WORKSPACE;
    }

    public static dmEntityIsFolder(dmEntity: DMEntity): boolean {
        return dmEntity.type === DMEntityType.FOLDER;
    }

    public static dmEntityIsDocument(dmEntity: DMEntity): boolean {
        return dmEntity.type === DMEntityType.DOCUMENT;
    }

    public static retrieveEntityIconName(iconService: IconService, dmEntity: DMEntity, iconPrefix: string): string {
        let iconName = 'file';
        if (this.dmEntityIsDocument(dmEntity)) {
            const iconNameWanted = (dmEntity as KimiosDocument).extension ?
                'file-' + (fileExtensionIconNameMapping[(dmEntity as KimiosDocument).extension] != null
                && fileExtensionIconNameMapping[(dmEntity as KimiosDocument).extension] !== undefined ?
                fileExtensionIconNameMapping[(dmEntity as KimiosDocument).extension] :
                (dmEntity as KimiosDocument).extension) :
                '';
            if (iconNameWanted !== '' && iconService.iconIsAvailableWithPrefix(iconPrefix, iconNameWanted)) {
                iconName = iconNameWanted;
            }
        }

        return iconName;
    }

    public static determinePropertyValue(entity: DMEntity, workspaceValue: string, folderValue: string, documentValue: string): string {
        return DMEntityUtils.dmEntityIsWorkspace(entity) ?
          workspaceValue :
          DMEntityUtils.dmEntityIsFolder(entity) ?
            folderValue :
            documentValue;
    }

    /*public static retrieveEntityIconName(iconService: IconService, dmEntity: DMEntity, iconPrefix: string): string {
        let iconName = 'file';
        if (this.dmEntityIsDocument(dmEntity)) {
            const iconNameWanted = (dmEntity as KimiosDocument).extension ?
                'file-' + (fileExtensionIconNameMapping[(dmEntity as KimiosDocument).extension] != null
                && fileExtensionIconNameMapping[(dmEntity as KimiosDocument).extension] !== undefined ?
                fileExtensionIconNameMapping[(dmEntity as KimiosDocument).extension] :
                (dmEntity as KimiosDocument).extension) :
                '';
            if (iconNameWanted !== '' && iconService.iconIsAvailableWithPrefix(iconPrefix, iconNameWanted)) {
                iconName = iconNameWanted;
            }
        }

        return iconName;
    }*/
}

export const fileExtensionIconNameMapping = {
    'jpg' : 'image',
    'jpeg' : 'image',
    'png' : 'image',
    'xls' : 'excel',
    'xlsx' : 'excel',
    'ppt' : 'powerpoint',
    'pptx' : 'powerpoint',
    'doc' : 'word',
    'docx' : 'word',
    'mp4' : 'video',
    'mov' : 'video',
    'mpeg' : 'video',
    'avi' : 'video',
    'mkv' : 'video',
    'm4v' : 'video',
    'mp3' : 'audio',
    'wav' : 'audio',
    'aac' : 'audio',
    'flac' : 'audio',
    'gz' : 'archive',
    'zip' : 'archive',
    'tar' : 'archive'
};
