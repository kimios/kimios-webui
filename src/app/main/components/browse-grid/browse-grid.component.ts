import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {BehaviorSubject} from 'rxjs';
import {concatMap, filter} from 'rxjs/operators';

@Component({
  selector: 'browse-grid',
  templateUrl: './browse-grid.component.html',
  styleUrls: ['./browse-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowseGridComponent implements OnInit, AfterContentInit {

  gridNbCols: number;
  entities$: BehaviorSubject<Array<DMEntity>>;

  widthPerEntity = 200;

  @ViewChild('entityList', {read: ElementRef}) entityList: ElementRef;

  @Input()
  entityContainer$: BehaviorSubject<DMEntity>;

  constructor(
      private browseEntityService: BrowseEntityService,
      private cd: ChangeDetectorRef
  ) {
    this.entities$ = new BehaviorSubject<Array<DMEntity>>([]);
    this.gridNbCols = 4;
  }

  ngOnInit(): void {
      this.entityContainer$
          .pipe(
              filter(entity => entity !== undefined),
              concatMap(res => this.browseEntityService.findEntitiesAtPath(res)),
          )
          .subscribe(
              res => {
                  this.entities$.next(res);
                  this.cd.markForCheck();
              }
          );
  }

  ngAfterContentInit(): void {
    this.gridNbCols = Math.floor(this.entityList.nativeElement.offsetWidth / this.widthPerEntity);

  }

  onResize($event): void {

  }
}
