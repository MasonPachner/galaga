import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Keyboard } from '../../systems/input-keyboard';
import { AppRoutes } from '../app/app.routes';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.less'
})
export class AboutComponent implements OnInit{

  constructor(private readonly router: Router){};
  public ngOnInit() {
    Keyboard.register('Escape', () => { this.router.navigate([AppRoutes.MainMenu]); });
  }
}
