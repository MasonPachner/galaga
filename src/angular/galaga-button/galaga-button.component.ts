import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'galaga-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './galaga-button.component.html',
  styleUrl: './galaga-button.component.less'
})
export class GalagaButtonComponent {
  @Output() public onClick = new EventEmitter<void>();
  @Input({required: true}) public text!: string;

}
