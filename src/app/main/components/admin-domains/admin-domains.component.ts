import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {Observable} from 'rxjs';
import {AdminService} from 'app/services/admin.service';
import {MatDialog} from '@angular/material';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {concatMap, filter, tap} from 'rxjs/operators';

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
      private dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    this.domains$ = this.adminService.domains$;

    this.adminService.newDomainCreated$.pipe(
      tap(() => this.refreshDomainList())
    ).subscribe();
  }

  selectDomain(name: string): void {
    this.adminService.newDomain$.next(false);
    this.adminService.selectedDomain$.next(name);
  }

  removeDomain(domain: AuthenticationSource): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle: 'Delete domain?',
        messageLine1: domain.name
      }
    });

    dialogRef.afterClosed().pipe(
      filter(res => res === true),
      concatMap(() => this.administrationService.deleteAuthenticationSource(
        this.sessionService.sessionToken,
        domain.name
      ))
    ).subscribe();
  }

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';
  }

  handleDomainCreation(): void {
    // this.adminService.selectedDomain$.next('');
    this.adminService.newDomain$.next(true);
  }

  refreshDomainList(): void {
    this.adminService.retrieveDomains();
  }
}
