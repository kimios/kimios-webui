import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DMEntity} from 'app/kimios-client-api';
import {BehaviorSubject} from 'rxjs';

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
      private cd: ChangeDetectorRef
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
}
