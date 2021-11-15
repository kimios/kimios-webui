import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable} from 'rxjs';
import {AdminService} from 'app/services/admin.service';

@Component({
  selector: 'admin-domains',
  templateUrl: './admin-domains.component.html',
  styleUrls: ['./admin-domains.component.scss'],
})
export class AdminDomainsComponent implements OnInit, AfterViewChecked {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomainName = '';
  @ViewChild('divider',  { read: ElementRef }) divider: ElementRef;

  constructor(
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private adminService: AdminService,
  ) {
    this.domains$ = this.adminService.domains$;
  }

  ngOnInit(): void {
  }

  selectDomain(name: string): void {
    this.adminService.selectedDomain$.next(name);
  }

    removeDomain(name: string): void {

    }

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';
  }
}
