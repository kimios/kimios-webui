import { Injectable } from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {findIconDefinition} from '@fortawesome/fontawesome-svg-core';
import {IconName, IconPrefix} from '@fortawesome/fontawesome-common-types';

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

  public iconIsAvailableWithPrefix(iconPrefix: string, iconName: string): boolean {
    const icon = findIconDefinition({
      'prefix': iconPrefix as IconPrefix,
      'iconName': iconName as IconName
    });

    return icon != null && icon !== undefined;
  }
}
