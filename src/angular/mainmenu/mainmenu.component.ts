import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppRoutes } from '../app/app.routes';
import { takeWhile, timer } from 'rxjs';
import { GalagaButtonComponent } from '../galaga-button/galaga-button.component';

interface NamedRoute {
  route: AppRoutes,
  name: string,
}

@Component({
  selector: 'app-mainmenu',
  standalone: true,
  imports: [CommonModule, GalagaButtonComponent],
  templateUrl: './mainmenu.component.html',
  styleUrl: './mainmenu.component.less'
})
export class MainmenuComponent implements OnInit, OnDestroy {
  private alive: boolean = true;
  private readonly attractTimeoutMs = 10000;

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) { }

  protected readonly routes: NamedRoute[] = [
    { route: AppRoutes.Game, name: "Start Game" },
    { route: AppRoutes.Scores, name: "View high scores" },
    { route: AppRoutes.Help, name: "Help" },
    { route: AppRoutes.About, name: "About" },
  ];

  public ngOnInit(): void {
    const optOutOfAttractMode = this.activatedRoute.snapshot.queryParams["autoStart"] === 'false';
    if(!optOutOfAttractMode) {
      timer(this.attractTimeoutMs).pipe(takeWhile(() => this.alive)).subscribe(_ => {
        this.router.navigate([AppRoutes.Game], { queryParams: { "attractMode": "true" } });
      })
    }
  }

  protected navigateTo(route: AppRoutes): void {
    this.router.navigate([route]);
  }



  public ngOnDestroy(): void {
    this.alive = false;
  }
}
