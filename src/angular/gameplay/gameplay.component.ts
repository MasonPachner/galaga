import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Player } from '../../objects/player';
import { AppRoutes } from '../app/app.routes';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameplayLoop } from '../../systems/gameplayloop';
import { GalagaButtonComponent } from '../galaga-button/galaga-button.component';

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [RouterModule, CommonModule, GalagaButtonComponent],
  templateUrl: './gameplay.component.html',
  styleUrl: './gameplay.component.less'
})
export class GameplayComponent implements OnInit, OnDestroy {

  protected showOverlay = false;

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute,private readonly cha: ChangeDetectorRef, private readonly zone: NgZone) { }

  public ngOnDestroy() {
    // window.removeEventListener('mousemove', () => this.returnToMain(), false);
    window.removeEventListener('mousedown', () => this.returnToMain(), false);
    window.removeEventListener('keydown', () => this.returnToMain());
  }

  public returnToMain() {
    if(GameplayLoop.forceStop) return;
    GameplayLoop.forceStop = true;
    this.router.navigate([AppRoutes.MainMenu]);
  }

  public ngOnInit() {
    Player.attract = this.activatedRoute.snapshot.queryParams["attractMode"] === 'true';
    if (Player.attract) {
      // window.addEventListener('mousemove', () => this.returnToMain(), false);
      window.addEventListener('mousedown', () => this.returnToMain(), false);
      window.addEventListener('keydown', () => this.returnToMain());
    }
    GameplayLoop.startGameplayLoop(() => this.onPause());
  }

  public onPause(){
    this.showOverlay = true;
    GameplayLoop.paused = true;

    this.zone.run(() => this.cha.detectChanges());
  }

  public onQuit() :void {
    this.showOverlay = false;
    GameplayLoop.reset();
    GameplayLoop.forceStop = true;
    // GalagaScreen.getElement("id-overlay").classList.remove('active');
    this.router.navigate([AppRoutes.MainMenu]);
  }

  public getContinuePhrase() :string{
    return Player.isGameOver ? "Restart" : "Continue";
  }

  public onContinue() :void{
    this.showOverlay = false;
    GameplayLoop.paused = false;
    if (Player.isGameOver) {
      GameplayLoop.forceStop = true;
      this.router.navigate([AppRoutes.Game], { queryParams: { "attractMode": "true" } });
    }
  }
}
