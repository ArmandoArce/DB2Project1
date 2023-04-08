import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetsHomeComponent } from './datasets-home.component';

describe('DatasetsHomeComponent', () => {
  let component: DatasetsHomeComponent;
  let fixture: ComponentFixture<DatasetsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetsHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
