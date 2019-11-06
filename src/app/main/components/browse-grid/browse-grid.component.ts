import {AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DMEntity} from '../../../kimios-client-api';
import {BrowseEntityService} from '../../../services/browse-entity.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'browse-grid',
  templateUrl: './browse-grid.component.html',
  styleUrls: ['./browse-grid.component.scss']
})
export class BrowseGridComponent implements OnInit, AfterContentInit {

  gridNbCols: number;
  entities: Array<DMEntity>;
  entityListHtmlId = 'entityList';
  widthPerEntity = 200;

  @ViewChild('entityList', {read: ElementRef}) entityList: ElementRef;

  @Input()
  entityContainer: DMEntity;

  constructor(private browseEntityService: BrowseEntityService) {
    this.entities = [];
    this.gridNbCols = 4;
  }

  ngOnInit(): void {
    this.loadEntities(this.entityContainer);
  }

  ngAfterContentInit(): void {
    this.gridNbCols = Math.floor(this.entityList.nativeElement.offsetWidth / this.widthPerEntity);

  }

  loadEntities(entity: DMEntity): void {
    this.browseEntityService.findEntitiesAtPath(
        entity !== null && entity !== undefined ?
            entity.uid :
            null
    ).subscribe(
        res => this.entities = res
    );
  }

  onResize($event): void {

  }
}
