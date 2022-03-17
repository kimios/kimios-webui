import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AdministrationService, AuthenticationSource, SecurityService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {AdminService} from 'app/services/admin.service';
import {MatDialog, MatTabGroup} from '@angular/material';
import {ConfirmDialogComponent} from 'app/main/components/confirm-dialog/confirm-dialog.component';
import {concatMap, filter, tap} from 'rxjs/operators';
import {CacheService} from 'app/services/cache.service';
import {UsersCacheService} from 'app/services/users-cache.service';

@Component({
  selector: 'admin-domains',
  templateUrl: './admin-domains.component.html',
  styleUrls: ['./admin-domains.component.scss'],
})
export class AdminDomainsComponent implements OnInit, AfterViewChecked {

  domains$: Observable<Array<AuthenticationSource>>;
  selectedDomainName = '';
  selectedDomain$: BehaviorSubject<string>;
  selectedDomain = '';
  newDomain$: BehaviorSubject<boolean>;
  newDomain = false;
  @ViewChild('divider',  { read: ElementRef }) divider: ElementRef;
  @ViewChild('matTabGroup') matTabGroup: MatTabGroup;
  @ViewChild('adminDomainsWrapper', { read: ElementRef }) adminDomainsWrapper: ElementRef;

  constructor(
      private sessionService: SessionService,
      private administrationService: AdministrationService,
      private securityService: SecurityService,
      private adminService: AdminService,
      private dialog: MatDialog,
      private cacheService: CacheService,
      private usersCacheService: UsersCacheService
  ) {
    this.selectedDomain$ = this.adminService.selectedDomain$;
    this.newDomain$ = this.adminService.newDomain$;
  }

  ngOnInit(): void {
    this.domains$ = this.adminService.domains$;

    this.adminService.selectedDomain$.pipe(
      tap(selected => this.selectedDomain = selected)
    ).subscribe();

    this.adminService.newDomain$.pipe(
      tap(bool => this.newDomain = bool)
    ).subscribe();

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
    ).subscribe(
      next => {
        if (this.selectedDomain === domain.name) {
          this.adminService.selectedDomain$.next('');
        }
        this.refreshDomainList();
      });
  }

  ngAfterViewChecked(): void {
    const previousSiblingHeight = this.divider.nativeElement.previousSibling.clientHeight;
    const nextSiblingHeight = this.divider.nativeElement.nextSibling.clientHeight;
    const dividerHeight = Math.max(previousSiblingHeight, nextSiblingHeight);
    this.divider.nativeElement.style.height = dividerHeight + 'px';

    /*if (this.matTabGroup !== undefined) {
      const windowTotalScreen = window.innerHeight;
      const matTabGroupOffsetTop = this.matTabGroup._tabBodyWrapper.nativeElement.offsetTop;
      const secondHeaderHeight = 56;
      this.matTabGroup._tabBodyWrapper.nativeElement.style.height = windowTotalScreen - matTabGroupOffsetTop - secondHeaderHeight - 15 + 'px';
    }*/

    /*const sectionHeight = this.adminDomainsWrapper.nativeElement.offsetHeight;
    console.log('sectionHeight : ' + sectionHeight);*/

    /*const browsePathAndActionsHeight = this.browsePathAndActions.nativeElement.offsetHeight;

    const height = (sectionHeight - browsePathAndActionsHeight) + 'px';
    this.treeAndGridRowWrapper.nativeElement.style.height = height;
    this.treeAndGridRowWrapper.nativeElement.style.maxHeight = height;
    this.treeAndGridRowWrapper.nativeElement.style.minHeight = height;*/
  }

  handleDomainCreation(): void {
    this.adminService.selectedDomain$.next('');
    this.adminService.newDomain$.next(true);
  }

  refreshDomainList(): void {
    this.adminService.retrieveDomains();
  }
}
