import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AdminService} from 'app/services/admin.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'admin-special-roles',
  templateUrl: './admin-special-roles.component.html',
  styleUrls: ['./admin-special-roles.component.scss']
})
export class AdminSpecialRolesComponent implements OnInit, AfterViewChecked {

  private _possibleRoles: Map<number, string> = new Map<number, string>([
    [3, 'Administrator'],
    [2, 'Studio user'],
    [5, 'Reporting user'],
    [1, 'Workspace creator'],
    [4, 'Meta feed access denied']
  ]);
  public possibleRolesId: Array<number>;
  @ViewChild('divider',  { read: ElementRef }) divider: ElementRef;
  selectedRole$: BehaviorSubject<number>;

  constructor(
      private adminService: AdminService,
  ) {
    this.possibleRolesId = Array.from(this._possibleRoles.keys());
    this.selectedRole$ = this.adminService.selectedRole$;
  }

  ngOnInit(): void {
  }

  selectRole(possibleRoleId: number): void {
    this.adminService.selectedRole$.next(possibleRoleId);
  }

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';
  }
}
