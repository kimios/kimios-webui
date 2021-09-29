import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material';

@Component({
  selector: 'app-shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.scss']
})
export class SharesComponent implements OnInit, AfterViewChecked {

  @ViewChild('matTabGroup') matTabGroup: MatTabGroup;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    const windowTotalScreen = window.innerHeight;
    const matTabGroupOffsetTop = this.matTabGroup._tabBodyWrapper.nativeElement.offsetTop;
    const secondHeaderHeight = 56;
    this.matTabGroup._tabBodyWrapper.nativeElement.style.height = windowTotalScreen - matTabGroupOffsetTop - secondHeaderHeight - 15 + 'px';
  }
}
