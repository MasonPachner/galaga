import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Persitence } from '../../screens/persistance';
import { Keyboard } from '../../systems/input-keyboard';
import { AppRoutes } from '../app/app.routes';
import { CommonModule } from '@angular/common';
import { GalagaButtonComponent } from '../galaga-button/galaga-button.component';

@Component({
  selector: 'app-helpmenu',
  standalone: true,
  imports: [CommonModule,GalagaButtonComponent],
  templateUrl: './helpmenu.component.html',
  styleUrl: './helpmenu.component.less'
})
export class HelpmenuComponent implements OnInit {

  constructor(private readonly router: Router) { };
  protected toChange: string | undefined = undefined;

  protected readonly keys = [
    'left','right','shoot','pause'
  ]

  public getCurrentBinding(key:string) : string{
    return Persitence.getBinding(key);
  }

  public returnToMenu() {
    this.router.navigate([AppRoutes.MainMenu]);
  }

  public markKeyForChange(str:string){
    this.toChange = str;
  }

  protected getChangeBindingMessage(str: string){
    return "Enter key to set: " + str;
  }

  public ngOnInit() {
    window.addEventListener('keydown', this.updateKey);
    Keyboard.register('Escape', () => { this.returnToMenu() });
  }
  public updateKey(e: any) {
    if(this.toChange == undefined) return;
    Persitence.addKeyBindings(this.toChange, e.key);
    this.toChange = undefined;
  }
}
