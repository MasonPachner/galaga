import { ActivatedRoute, Router } from "@angular/router";
import { AppRoutes } from "../angular/app/app.routes";
import { Enemies } from "../objects/enemies";
import { Player } from "../objects/player";
import { Projectiles, Projectile } from "../objects/projectiles";
import { Wave } from "../objects/wave";
import { Persitence, KeyBinding } from "../screens/persistance";
import { Sparkle } from "./background-sparkle";
import { Collisions } from "./collisions";
import { Keyboard } from "./input-keyboard";
import { ParticleSystem } from "./particle-system";
import { Renderer } from "./renderer";
import { ScreenText } from "./screen-text";


export class GameplayLoop {
  private  static score = 0;
  private static level = 0;
  public static paused = false;
  private  static lastTimeStamp = performance.now();
  public static forceStop = false;

  protected showOverlay = false;
  private static onPause: () => void;

  public static  render() {
    Renderer.clear();
    Sparkle.render();
    ParticleSystem.render();

    Projectiles.renderProjectiles();
    Player.renderPlayer();
    Enemies.render();
    GameplayLoop.renderScore();
    ScreenText.render();
  }


  public static renderScore() {
    Renderer.strongText("Score: " + GameplayLoop.score, 10, 25, 20, 'rgba(255,255,255,1)', true);
    Renderer.displayLevel(Wave.level);
  }

  public static update(elapsedTime: number) {
    if (elapsedTime > 1000) {
      console.log("Long frame on");
    }
    if (!GameplayLoop.paused) {
      Sparkle.update(elapsedTime); // Always sparkle ? 
      ScreenText.update(elapsedTime);
      Player.update(elapsedTime, GameplayLoop.score);
      Projectiles.update(elapsedTime);
      Wave.update(elapsedTime);
      Enemies.update(elapsedTime);
      ParticleSystem.update(elapsedTime);
      GameplayLoop.score += Collisions.collisonHandler();
      GameplayLoop.levelUp();
    }

  }


  public static levelUp() {
    if (Enemies.enemies.length == 0) {
      Projectiles.proj.forEach((e: Projectile) => {
        e.dirty = true;
      });
      GameplayLoop.level++;
      let hits = Player.updateAccuracy();
      if (Wave.isChallengeLevel()) {
        ScreenText.addText("HITS: " + hits, 0.5, 0.5, 30, 3000, 'rgba(255,100,255,1)');
        ScreenText.addText("BONUS: " + (hits * 100), 0.5, 0.5, 30, 3000, 'rgba(255,100,255,1)');
        GameplayLoop.score += hits * 100;
      }
      Wave.levelUp(GameplayLoop.level);
    }
  }

  public static reset() : void {
    GameplayLoop.score = 0;
    GameplayLoop.level = 1;
    Projectiles.reset();
    Player.reset();
    ParticleSystem.reset();
  }


  public static gameloop(time: number) {
    Keyboard.update(time);
    let elapsedTime = (time - GameplayLoop.lastTimeStamp);
    GameplayLoop.update(elapsedTime);
    GameplayLoop.render();
    GameplayLoop.lastTimeStamp = time;
    if (Player.attract && Player.isGameOver) {
      setTimeout(() => {
        GameplayLoop.forceStop = true;
        GameplayLoop.startGameplayLoop(GameplayLoop.onPause);
      }, 5000);
      return;
    }
    if (GameplayLoop.forceStop) {
      return;
    }
    requestAnimationFrame((dt) => GameplayLoop.gameloop(dt));
  }

  public static startGameplayLoop(onPause: () => void){
    GameplayLoop.onPause = onPause;
    GameplayLoop.paused = false;
    Keyboard.registerExisting(onPause);
    GameplayLoop.score = 0;
    GameplayLoop.level = 0;
    ParticleSystem.reset();
    GameplayLoop.forceStop = false;
    GameplayLoop.lastTimeStamp = performance.now();
    requestAnimationFrame((dt) => GameplayLoop.gameloop(dt));
  }

}