import { Component, OnInit } from '@angular/core';
import { Persitence } from '../../screens/persistance';
import { Keyboard } from '../../systems/input-keyboard';
import { Router } from '@angular/router';
import { AppRoutes } from '../app/app.routes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-highscores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './highscores.component.html',
  styleUrl: './highscores.component.less'
})
export class HighscoresComponent implements OnInit{

  constructor(private readonly router: Router){};

  public ngOnInit() {
      Keyboard.register('Escape', () => { this.router.navigate([AppRoutes.MainMenu]); });
      Persitence.report();
  }
}
