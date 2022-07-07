import { Component, OnInit } from '@angular/core';
import {PluginService} from 'app/kimios-client-api/api/plugin.service';
import {Plugin as KimiosPlugin} from 'app/kimios-client-api/model/plugin';
import {BehaviorSubject} from 'rxjs';
import {SessionService} from 'app/services/session.service';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'plugin-center',
  templateUrl: './plugin-center.component.html',
  styleUrls: ['./plugin-center.component.scss']
})
export class PluginCenterComponent implements OnInit {

  private pluginList$: BehaviorSubject<Array<KimiosPlugin>>;

  constructor(
    private pluginService: PluginService,
    private sessionService: SessionService
  ) {
    this.pluginList$ = new BehaviorSubject<Array<KimiosPlugin>>([]);
  }

  ngOnInit(): void {
    this.pluginService.getAll(this.sessionService.sessionToken).pipe(
      tap(plugins => this.pluginList$.next(plugins))
    ).subscribe();
  }

}
