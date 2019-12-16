import {Router} from '@angular/router';

export class DocumentUtils {
    static textExtensions = ['txt', 'java', 'cs', 'js', 'cpp', 'c', 'cc', 'html', 'log', 'sql', 'py', 'xml', 'java', 'eml', 'pl', 'caml'
        , 'css', 'scss', 'sh', 'bat'];
    static extensionsToBeConvertedToPdf = ['odt', 'odp', 'xls', 'xlsx', 'docx', 'doc'];
    static imgExtensions = ['png', 'jpg', 'jpeg', 'tif', 'tiff', 'gif', 'pdf'];

    static viewableExtensions = ['asciidoc', 'adoc', 'ps']
        .concat(DocumentUtils.textExtensions)
        .concat(DocumentUtils.extensionsToBeConvertedToPdf)
        .concat(DocumentUtils.imgExtensions);

    public static extensionIsText(extension: string): boolean {
        return this.textExtensions.includes(extension.toLowerCase());
    }

    public static extensionHasToBeConvertedToPdf(extension: string): boolean {
        return this.extensionsToBeConvertedToPdf.includes(extension.toLowerCase());
    }

    public static extensionIsImg(extension: string): boolean {
        return this.imgExtensions.includes(extension.toLowerCase());
    }

    public static navigateToFile(router: Router, docUid: number): void {
        router.navigate(['/document', docUid]);
    }

    public static navigateToFolderOrWorkspace(router: Router, folderUid: number): void {
        router.navigate(['/browse', folderUid]);
    }
}
