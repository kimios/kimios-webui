import { Injectable } from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

export enum IconsEnum {
  Workspace = 'workspace'
}


@Injectable({
  providedIn: 'root'
})
export class IconService {

  private matIconRegistry: MatIconRegistry;

  constructor(
      matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry = matIconRegistry;
  }

  public registerIcons(): void {
    this.loadIcons(Object.values(IconsEnum), 'assets_kimios/icons/svg');
  }

  private loadIcons(iconKeys: string[], iconUrl: string): void {
    iconKeys.forEach(key => {
      this.matIconRegistry.addSvgIcon(key, this.domSanitizer.bypassSecurityTrustResourceUrl(`${iconUrl}/${key}.svg`));
    });
  }
}
