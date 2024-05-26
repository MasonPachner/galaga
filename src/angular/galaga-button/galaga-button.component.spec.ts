import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalagaButtonComponent } from './galaga-button.component';

describe('GalagaButtonComponent', () => {
  let component: GalagaButtonComponent;
  let fixture: ComponentFixture<GalagaButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalagaButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GalagaButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
