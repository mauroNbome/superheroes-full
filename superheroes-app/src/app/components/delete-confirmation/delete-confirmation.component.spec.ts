import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { DeleteConfirmationComponent } from './delete-confirmation.component';
import { MaterialModule } from '@shared/material.module';
import { Hero } from '@models/hero';
import { formatDate } from '@shared/utils';

describe('DeleteConfirmationComponent', () => {
  let component: DeleteConfirmationComponent;
  let fixture: ComponentFixture<DeleteConfirmationComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DeleteConfirmationComponent>>;
  let mockHero: Hero;

  beforeEach(async () => {
    mockHero = {
      id: 1,
      name: 'SUPERMAN',
      alias: 'Clark Kent',
      powers: ['Vuelo', 'Fuerza sobrehumana'],
      city: 'Metropolis',
      description: '',
      imageUrl: '',
      powerLevel: 10,
      isActive: true,
      createdAt: '1938-06-01T00:00:00.000Z',
      updatedAt: '1938-06-01T00:00:00.000Z',
      powerCount: 2,
      powerLevelDescription: 'Élite'
    };

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        DeleteConfirmationComponent,
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { hero: mockHero } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<DeleteConfirmationComponent>>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero information', () => {
    fixture.detectChanges();
    
    const title = fixture.debugElement.query(By.css('.modal-title span'));
    const heroName = fixture.debugElement.query(By.css('.hero-name strong'));
    
    expect(title.nativeElement.textContent).toContain('Confirmar Eliminación');
    expect(heroName.nativeElement.textContent).toContain('SUPERMAN');
  });

  it('should close dialog with false when cancelled', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when confirmed', () => {
    component.onConfirm();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should format date correctly', () => {
    const date = new Date('2023-01-15');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/1[45] ene 2023/i);
  });

  it('should show warning message', () => {
    fixture.detectChanges();
    
    const warningBadge = fixture.debugElement.query(By.css('.warning-badge'));
    expect(warningBadge).toBeTruthy();
    expect(warningBadge.nativeElement.textContent).toContain('Esta acción no se puede deshacer');
  });

  it('should have cancel and confirm buttons', () => {
    fixture.detectChanges();
    
    const cancelBtn = fixture.debugElement.query(By.css('[data-testid="cancel-delete-btn"]'));
    const confirmBtn = fixture.debugElement.query(By.css('[data-testid="confirm-delete-btn"]'));
    
    expect(cancelBtn).toBeTruthy();
    expect(confirmBtn).toBeTruthy();
    expect(cancelBtn.nativeElement.textContent).toContain('Cancelar');
    expect(confirmBtn.nativeElement.textContent).toContain('Eliminar Héroe');
  });
}); 