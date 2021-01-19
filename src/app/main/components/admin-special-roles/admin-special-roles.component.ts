import {Component, OnInit} from '@angular/core';
import {AdminService} from 'app/services/admin.service';

@Component({
  selector: 'admin-special-roles',
  templateUrl: './admin-special-roles.component.html',
  styleUrls: ['./admin-special-roles.component.scss']
})
export class AdminSpecialRolesComponent implements OnInit {

  private _possibleRoles: Map<number, string> = new Map<number, string>([
    [3, 'Administrator'],
    [2, 'Studio user'],
    [5, 'Reporting user'],
    [1, 'Workspace creator'],
    [4, 'Meta feed access denied']
  ]);
  public possibleRolesId: Array<number>;

  constructor(
      private adminService: AdminService,
  ) {
    this.possibleRolesId = Array.from(this._possibleRoles.keys());
  }

  ngOnInit(): void {
  }

  selectRole(possibleRoleId: number): void {
    this.adminService.selectedRole$.next(possibleRoleId);
  }
}
