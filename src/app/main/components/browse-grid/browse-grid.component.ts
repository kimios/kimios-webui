import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {BehaviorSubject} from 'rxjs';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {BrowseEntityService} from 'app/services/browse-entity.service';

@Component({
  selector: 'browse-grid',
  templateUrl: './browse-grid.component.html',
  styleUrls: ['./browse-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowseGridComponent implements OnInit, AfterContentInit {

  gridNbCols: number;
  @Input()
  entities$: BehaviorSubject<Array<DMEntity>>;
  entities: Array<DMEntity>;

  widthPerEntity = 200;

  @ViewChild('entityList', {read: ElementRef}) entityList: ElementRef;

  constructor(
      private cd: ChangeDetectorRef,
      private router: Router,
      private bes: BrowseEntityService
  ) {
    this.gridNbCols = 4;
    this.entities = [];
  }

  ngOnInit(): void {
      this.entities$.subscribe(
          res => {
              this.entities = res;
              this.cd.markForCheck();
          }
      );
  }

  ngAfterContentInit(): void {
    this.gridNbCols = Math.floor(this.entityList.nativeElement.offsetWidth / this.widthPerEntity);

  }

  onResize($event): void {
      this.gridNbCols = Math.floor(this.entityList.nativeElement.offsetWidth / this.widthPerEntity);
  }

  goToDocument(entityFromList: DMEntity): void {
    if (DMEntityUtils.dmEntityIsFolder(entityFromList) || DMEntityUtils.dmEntityIsWorkspace(entityFromList)) {
      this.bes.selectedEntity$.next(entityFromList);
      const currentPath = this.bes.currentPath.getValue();
      if (currentPath.filter(dir => dir.uid === entityFromList.uid).length === 0) {
        currentPath.push(entityFromList);
        this.bes.currentPath.next(currentPath);
      }
    } else {
      DocumentUtils.navigateToFile(this.router, entityFromList.uid);
    }
  }
}
