import { Component, OnInit } from '@angular/core';
import { Keyboard } from '../../systems/input-keyboard';
import { Renderer } from '../../systems/renderer';
import { Enemies } from '../../objects/enemies';
import { Player } from '../../objects/player';
import { Projectiles } from '../../objects/projectiles';
import { Wave } from '../../objects/wave';
import { Persitence } from '../../screens/persistance';
import { GalagaScreen } from '../../screens/galagascreen';
import { Sparkle } from '../../systems/background-sparkle';
import { Collisions } from '../../systems/collisions';
import { ParticleSystem } from '../../systems/particle-system';
import { ScreenText } from '../../systems/screen-text';
import { Utils } from '../../systems/utils';
import { AppRoutes } from '../app/app.routes';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [],
  templateUrl: './gameplay.component.html',
  styleUrl: './gameplay.component.less'
})
export class GameplayComponent implements OnInit{
  private score = 0;
  private level = 0;
  private attract = false;
  private paused = false;
  private lastTimeStamp = performance.now();
  private forceStop = false;

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) { }
  public processInput() {
    Keyboard.update();
  }

  public render() {
    Renderer.clear();
    Sparkle.render();
    ParticleSystem.render();

    Projectiles.renderProjectiles();
    Player.renderPlayer();
    Enemies.render();
    this.renderScore();
    ScreenText.render();
  }


  public renderScore() {
    Renderer.strongText("Score: " + this.score, 10, 25, 20, 'rgba(255,255,255,1)', true);
    Renderer.displayLevel((Wave.level));
  }

  public update(elapsedTime: number) {
    // console.log(elapsedTime)
    if (elapsedTime > 1000) {
      console.log("Long frame on");
    }
    if (!this.paused) {
      Sparkle.update(elapsedTime); // Always sparkle ? 
      ScreenText.update(elapsedTime);
      Player.update(elapsedTime, this.score);
      Projectiles.update(elapsedTime);
      Wave.update(elapsedTime);
      Enemies.update(elapsedTime);
      ParticleSystem.update(elapsedTime);
      this.score += Collisions.collisonHandler();
      this.levelUp();
    }

  }


  public levelUp() {
    if (Enemies.enemies.length == 0) {
      Projectiles.proj.forEach((e: any) => {
        e.dirty = true;
      });
      this.level++;
      let hits = Player.updateAccuracy();
      if (Wave.isChallengeLevel()) {
        ScreenText.addText("HITS: " + hits, 0.5, 0.5, 30, 3000, 'rgba(255,100,255,1)');
        ScreenText.addText("BONUS: " + (hits * 100), 0.5, 0.5, 30, 3000, 'rgba(255,100,255,1)');
        this.score += hits * 100;
      }
      Wave.levelUp(this.level);
    }
  }

  public reset() {
    this.score = 0;
    this.level = 1;
    Projectiles.reset();
    Player.reset();
    ParticleSystem.reset();
  }


  public gameloop(time: number) {
    this.processInput();
    let elapsedTime = (time - this.lastTimeStamp);
    this.update(elapsedTime);
    this.render();
    this.lastTimeStamp = time;
    if (this.attract && Player.isGameOver) {
      setTimeout(() => {
        this.forceStop = true;
        this.router.navigate([AppRoutes.Game], { queryParams: { "attractMode": this.attract } });
      }, 5000);
      return;
    }
    if (this.forceStop) {
      return;
    }
    requestAnimationFrame(this.gameloop);
  }

  public returnToMain() {
    window.removeEventListener('mousemove', this.returnToMain, false);
    window.removeEventListener('mousedown', this.returnToMain, false);
    window.removeEventListener('keydown', this.returnToMain);
    this.forceStop = true;
    this.router.navigate([AppRoutes.MainMenu]);
  }

  public ngOnInit() {
    this.attract = this.activatedRoute.snapshot.paramMap.get("attractMode") === 'true';
    if (this.attract) {
      window.addEventListener('mousemove', this.returnToMain, false);
      window.addEventListener('mousedown', this.returnToMain, false);
      window.addEventListener('keydown', this.returnToMain);
    }
    this.lastTimeStamp = performance.now();
    this.paused = false;
    Keyboard.initialize();
    Keyboard.register(Persitence.getBinding('pause'), () => {
      this.paused = true;
      if (Player.isGameOver) {
        GalagaScreen.getElement('id-continue').innerHTML = "Restart";
      }
      GalagaScreen.getElement("id-overlay").classList.add('active');
      GalagaScreen.getElement("id-overlay").style.top = ((Utils.canvas.height - 100) / 2).toString();
      GalagaScreen.getElement("id-overlay").style.left = ((Utils.canvas.width - 300) / 2).toString();
    });
    GalagaScreen.getElement('id-continue').innerHTML = "Continue";
    Keyboard.register(Persitence.getBinding('left'), () => {
      Player.inputMove(-1);
    });
    Keyboard.register(Persitence.getBinding('right'), () => {
      Player.inputMove(1);
    });
    Keyboard.register(Persitence.getBinding('shoot'), () => {
      Player.inputShoot();
    });
    this.score = 0;
    this.level = 0;
    this.paused = false;
    ParticleSystem.reset();
    this.forceStop = false;
    this.lastTimeStamp = performance.now();
    requestAnimationFrame((dt) => this.gameloop(dt));
  }

  public onQuit() {
    this.reset();
    this.forceStop = true;
    GalagaScreen.getElement("id-overlay").classList.remove('active');
    this.router.navigate([AppRoutes.MainMenu]);
  }

  public onContinue(){
    this.paused = false;
    GalagaScreen.getElement("id-overlay").classList.remove('active');
    if (Player.isGameOver) {
      GalagaScreen.getElement('id-continue').innerHTML = "Restart";
      this.forceStop = true;
      this.router.navigate([AppRoutes.Game], { queryParams: { "attractMode": "true" } });
    }
  }
}