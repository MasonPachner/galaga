import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Assets } from '../../systems/assets';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements OnInit {
  protected loaded: boolean = false;
  constructor(private readonly cha: ChangeDetectorRef, private readonly zone: NgZone) { }
  public ngOnInit(){
    Assets.initialize().then(() => {
      this.loaded = true; 
      this.zone.run(() => this.cha.detectChanges());
    });
  }
}
