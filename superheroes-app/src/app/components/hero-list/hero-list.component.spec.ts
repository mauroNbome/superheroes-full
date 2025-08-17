import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { HeroListComponent } from './hero-list.component';
import { HeroService } from '@services/hero.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@shared/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Hero } from '@models/hero';
import { DeleteConfirmationComponent } from '@components/delete-confirmation/delete-confirmation.component';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;

  const mockHeroes: Hero[] = [
    {
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
    },
    {
      id: 2,
      name: 'BATMAN',
      alias: 'Bruce Wayne',
      powers: ['Inteligencia', 'Tecnología'],
      city: 'Gotham',
      description: '',
      imageUrl: '',
      powerLevel: 6,
      isActive: true,
      createdAt: '1939-05-01T00:00:00.000Z',
      updatedAt: '1939-05-01T00:00:00.000Z',
      powerCount: 2,
      powerLevelDescription: 'Intermedio'
    },
    {
      id: 3,
      name: 'WONDER WOMAN',
      alias: 'Diana Prince',
      powers: ['Fuerza amazónica'],
      city: 'Themyscira',
      description: '',
      imageUrl: '',
      powerLevel: 9,
      isActive: false,
      createdAt: '1941-12-01T00:00:00.000Z',
      updatedAt: '1941-12-01T00:00:00.000Z',
      powerCount: 1,
      powerLevelDescription: 'Avanzado'
    }
  ];

  /** Mock paginated response structure */
  const mockPaginatedResponse = {
    heroes: mockHeroes,
    totalItems: mockHeroes.length,
    totalPages: 1,
    currentPage: 1
  };

  beforeEach(async () => {
    const heroServiceSpy = jasmine.createSpyObj('HeroService', [
      'searchHeroesByNamePaginated',
      'updateHero',
      'deleteHero'
    ]);

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HeroListComponent,
        MaterialModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);

    // Setup default spy returns
    heroService.searchHeroesByNamePaginated.and.returnValue(of(mockPaginatedResponse));
    heroService.updateHero.and.returnValue(of(mockHeroes[0]));
    heroService.deleteHero.and.returnValue(of(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(component.isLoading()).toBeFalse();
      expect(component.isPaginating()).toBeFalse();
      expect(component.totalHeroes()).toBe(0);
      expect(component.pageSize()).toBe(10);
      expect(component.currentPage()).toBe(0);
      expect(component.searchControl.value).toBe('');
    });

    it('should load heroes on initialization', fakeAsync(() => {
      component.ngOnInit();
      tick(400); // Wait for debounce + delay

      expect(heroService.searchHeroesByNamePaginated).toHaveBeenCalledWith('', 1, 10);
      expect(component.dataSource.data).toEqual(mockHeroes);
      expect(component.totalHeroes()).toBe(mockHeroes.length);
    }));
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should perform search with debounce', fakeAsync(() => {
      component.ngOnInit();
      heroService.searchHeroesByNamePaginated.calls.reset();
      component.searchControl.setValue('SUPER');
      tick(300);
      expect(heroService.searchHeroesByNamePaginated).toHaveBeenCalledWith('SUPER', 1, 10);
    }));

    it('should reset pagination when searching', fakeAsync(() => {
      component.ngOnInit();
      component.currentPage.set(2);
      heroService.searchHeroesByNamePaginated.calls.reset();
      component.searchControl.setValue('BATMAN');
      tick(300);
      expect(component.currentPage()).toBe(0);
    }));

    it('should clear search when clearSearch is called', () => {
      component.searchControl.setValue('test');
      component.clearSearch();
      
      expect(component.searchControl.value).toBe('');
    });
  });

  describe('Loading States', () => {
    it('should show initial loading state', () => {
      component.loadHeroes(true);
      expect(component.isLoading()).toBeTrue();
      expect(component.isPaginating()).toBeFalse();
    });

    it('should show pagination loading state', () => {
      component.loadHeroes(false);
      expect(component.isLoading()).toBeFalse();
      expect(component.isPaginating()).toBeTrue();
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle page changes', () => {
      const pageEvent = { pageIndex: 2, pageSize: 10 };
      component.onPageChange(pageEvent);

      expect(component.currentPage()).toBe(2);
      expect(component.pageSize()).toBe(10);
      expect(heroService.searchHeroesByNamePaginated).toHaveBeenCalledWith('', 3, 10);
    });
  });

  describe('Hero Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

         it('should toggle hero active status', fakeAsync(() => {
       const hero = mockHeroes[0];
       const updatedHero = { ...hero, isActive: false };
       heroService.updateHero.and.returnValue(of(updatedHero));

       component.onToggleActive(hero);
       tick();

       expect(heroService.updateHero).toHaveBeenCalledWith(updatedHero);
       spyOn<any>(component['snackBar'], 'open');
       // Disparar nuevamente para capturar snackbar
       component.onToggleActive(hero);
       tick();
       expect(component['snackBar'].open).toHaveBeenCalledWith(
         'Hero deactivated successfully',
         'Close',
         jasmine.objectContaining({
           duration: 3000,
           panelClass: ['success-snackbar']
         })
       );
     }));

         it('should handle toggle errors gracefully', fakeAsync(() => {
       const hero = mockHeroes[0];
       heroService.updateHero.and.returnValue(throwError(() => new Error('Update failed')));

       spyOn<any>(component['snackBar'], 'open');
       component.onToggleActive(hero);
       tick();

       expect(component['snackBar'].open).toHaveBeenCalledWith(
         'Error updating hero: Update failed',
         'Close',
         jasmine.objectContaining({
           duration: 5000,
           panelClass: ['error-snackbar']
         })
       );
     }));
  });

  describe('Dialog Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should open create hero dialog', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(null));
      spyOn<any>(component['dialog'], 'open').and.returnValue(dialogRefSpy);
      component.onAddHero();
      expect(component['dialog'].open).toHaveBeenCalled();
    });

    it('should open edit hero dialog', () => {
      const hero = mockHeroes[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(null));
      spyOn<any>(component['dialog'], 'open').and.returnValue(dialogRefSpy);
      component.onEditHero(hero);

      expect(component['dialog'].open).toHaveBeenCalled();
    });

    it('should open delete confirmation dialog', () => {
      const hero = mockHeroes[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      spyOn<any>(component['dialog'], 'open').and.returnValue(dialogRefSpy);
      component.onDeleteHero(hero);

      expect(component['dialog'].open).toHaveBeenCalledWith(
        DeleteConfirmationComponent,
        jasmine.any(Object)
      );
    });

    it('should delete hero when confirmed', fakeAsync(() => {
      const hero = mockHeroes[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      spyOn<any>(component['dialog'], 'open').and.returnValue(dialogRefSpy);
      component.onDeleteHero(hero);
      tick();

      expect(heroService.deleteHero).toHaveBeenCalledWith(hero.id);
    }));
  });

  xdescribe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

         it('should handle search errors gracefully', fakeAsync(() => {
       heroService.searchHeroesByNamePaginated.and.returnValue(
         throwError(() => new Error('Search failed'))
       );

       component.loadHeroes();
       tick(300);

       expect(snackBar.open).toHaveBeenCalledWith(
         'Error loading heroes: Search failed',
         'Close',
         jasmine.objectContaining({
           duration: 5000,
           panelClass: ['error-snackbar']
         })
       );
       expect(component.dataSource.data).toEqual([]);
       expect(component.totalHeroes()).toBe(0);
     }));

         it('should handle delete errors gracefully', fakeAsync(() => {
       const hero = mockHeroes[0];
       heroService.deleteHero.and.returnValue(throwError(() => new Error('Delete failed')));

       component['performDelete'](hero);
       tick();

       expect(snackBar.open).toHaveBeenCalledWith(
         'Error deleting hero: Delete failed',
         'Close',
         jasmine.objectContaining({
           duration: 5000,
           panelClass: ['error-snackbar']
         })
       );
     }));
  });

  describe('Utility Methods', () => {
    it('should format dates correctly', () => {
      const date = new Date('2023-01-15');
      const formatted = component.formatDate(date);
      expect(formatted).toBeTruthy();
    });

    it('should return correct status text', () => {
      expect(component.getStatusText(true)).toBe('Activo');
      expect(component.getStatusText(false)).toBe('Inactivo');
    });

    it('should return correct status colors', () => {
      expect(component.getStatusColor(true)).toBe('primary');
      expect(component.getStatusColor(false)).toBe('warn');
    });
  });

  describe('Navigation', () => {
    it('should navigate to hero detail', () => {
      const routerSpy = spyOn(component['router'], 'navigate');
      const hero = mockHeroes[0];

      component.viewHeroDetail(hero);

      expect(routerSpy).toHaveBeenCalledWith(['/hero', hero.id]);
    });
  });
}); 