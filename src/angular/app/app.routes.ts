import { Routes } from '@angular/router';
import { MainmenuComponent } from '../mainmenu/mainmenu.component';
import { GameplayComponent } from '../gameplay/gameplay.component';
import { AboutComponent } from '../about/about.component';
import { HighscoresComponent } from '../highscores/highscores.component';
import { HelpmenuComponent } from '../helpmenu/helpmenu.component';

export enum AppRoutes{
    About = "about",
    Game = "game",
    Help = "help",
    Scores = "scores",
    MainMenu ="menu",
}


export const routes: Routes = [
    {
        path: AppRoutes.About,
        component: AboutComponent,
        pathMatch: 'full',
    },
    {
        path: AppRoutes.Game,
        component: GameplayComponent,
        pathMatch: 'full',
    },
    {
        path: AppRoutes.Help,
        component: HelpmenuComponent,
        pathMatch: 'full',
    },
    {
        path: AppRoutes.Scores,
        component: HighscoresComponent,
        pathMatch: 'full',
    },
    {
        path: AppRoutes.MainMenu,
        component: MainmenuComponent,
        pathMatch: 'full',
    },
    { path: '**', redirectTo: AppRoutes.MainMenu, pathMatch: 'full' },
];
