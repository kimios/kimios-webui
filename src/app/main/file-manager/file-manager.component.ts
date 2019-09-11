import {Component, OnInit} from '@angular/core';

export const DEFAULT_PATH = 'ng_workspace/root_folder';


@Component({
    selector: 'app-file-manager',
    templateUrl: './file-manager.component.html',
    styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

    constructor() {
    }

    ngOnInit(): void {
    }


}



