import { Component, OnInit, OnDestroy, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { MaterialModule } from '@shared/material.module';
import { HeroService } from '@services/hero.service';
import { Hero, HeroCreateRequest, HeroUpdateRequest, HeroLegacy } from '@models/hero';
import { isFutureDate, isValidDate, formatDateForInput, getCurrentDate, showSuccessMessage, showErrorMessage } from '@shared/utils';
import { UppercaseDirective } from '@app/directives/uppercase.directive';

/**
 * Dialog data interface for hero form configuration
 */
export interface HeroFormDialogData {
  hero?: Hero;
  mode: 'create' | 'edit';
}

/**
 * Form field validation limits interface
 */
interface FormLimits {
  readonly name: { min: number; max: number };
  readonly alias: { min: number; max: number };
  readonly city: { min: number; max: number };
  readonly description: { min: number; max: number };
  readonly imageUrl: { min: number; max: number };
  readonly powers: { min: number; max: number; arrayMin: number; arrayMax: number };
}

/**
 * Field display names for error messages
 */
interface FieldLabels {
  readonly [key: string]: string;
}

/**
 * Form validation limits and constraints
 */
const FORM_LIMITS: FormLimits = {
  name: { min: 2, max: 50 },
  alias: { min: 2, max: 50 },
  city: { min: 2, max: 50 },
  description: { min: 10, max: 500 },
  imageUrl: { min: 0, max: 500 },
  powers: { min: 3, max: 50, arrayMin: 1, arrayMax: 10 }
} as const;

/**
 * Human-readable field names for validation messages
 */
const FIELD_LABELS: FieldLabels = {
  name: 'Hero name',
  alias: 'Hero alias',
  city: 'City',
  description: 'Description',
  imageUrl: 'Image URL',
  powers: 'Powers',
  powerLevel: 'Power level'
} as const;

/**
 * Text pattern for name and alter ego fields (letters, spaces, hyphens)
 */
const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s-]+$/;
// URL pattern simple para validar cuando hay contenido (campo es opcional)
const URL_PATTERN = /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#\[\]@!$&'()*+,;=.]*$/i;

/**
 * Hero form component for creating and editing heroes
 * Features dual mode operation with comprehensive validation and Material Design integration
 */
@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, UppercaseDirective],
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.css']
})
export class HeroFormComponent implements OnInit, OnDestroy {

  /** Destruction subject for subscription cleanup */
  private readonly destroy$ = new Subject<void>();

  /** Angular services */
  private readonly fb = inject(FormBuilder);
  private readonly heroService = inject(HeroService);
  private readonly snackBar = inject(MatSnackBar);

  /** Reactive form for hero data management */
  heroForm!: FormGroup;

  /** Loading state for UI feedback during operations */
  isLoading = false;

  /** Current operation mode */
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  /** Dynamic dialog title based on operation mode */
  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Hero' : 'Add New Hero';
  }

  /** Dynamic action button text based on operation mode */
  get actionButtonText(): string {
    return this.isEditMode ? 'Update' : 'Create';
  }

  constructor(
    public readonly dialogRef: MatDialogRef<HeroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: HeroFormDialogData
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.populateFormData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Creates the reactive form with comprehensive validation rules
   */
  private createForm(): void {
    this.heroForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(FORM_LIMITS.name.min),
        Validators.maxLength(FORM_LIMITS.name.max),
        Validators.pattern(NAME_PATTERN)
      ]],
      alias: ['', [
        Validators.required,
        Validators.minLength(FORM_LIMITS.alias.min),
        Validators.maxLength(FORM_LIMITS.alias.max),
        Validators.pattern(NAME_PATTERN)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(FORM_LIMITS.city.min),
        Validators.maxLength(FORM_LIMITS.city.max)
      ]],
      description: ['', [
        Validators.minLength(FORM_LIMITS.description.min),
        Validators.maxLength(FORM_LIMITS.description.max)
      ]],
      imageUrl: ['', [
        Validators.maxLength(FORM_LIMITS.imageUrl.max),
        Validators.pattern(URL_PATTERN)
      ]],
      powers: [[], [
        Validators.required,
        this.powersArrayValidator
      ]],
      powerLevel: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ]],
      isActive: [true]
    });
  }

  /**
   * Populates form with existing hero data in edit mode
   */
  private populateFormData(): void {
    if (this.isEditMode && this.data.hero) {
      const hero = this.data.hero;
      this.heroForm.patchValue({
        name: hero.name,
        alias: hero.alias,
        city: hero.city,
        description: hero.description || '',
        imageUrl: hero.imageUrl || '',
        powers: Array.isArray(hero.powers) ? [...hero.powers] : [],
        powerLevel: hero.powerLevel,
        isActive: hero.isActive
      });
    }
  }

  /**
   * Custom validator for powers array
   */
  private readonly powersArrayValidator = (control: AbstractControl): ValidationErrors | null => {
    const powers = control.value as string[];
    
    if (!powers || !Array.isArray(powers)) {
      return { invalidArray: true };
    }
    
    if (powers.length < FORM_LIMITS.powers.arrayMin) {
      return { arrayTooShort: { min: FORM_LIMITS.powers.arrayMin } };
    }
    
    if (powers.length > FORM_LIMITS.powers.arrayMax) {
      return { arrayTooLong: { max: FORM_LIMITS.powers.arrayMax } };
    }
    
    // Validate each power
    for (const power of powers) {
      if (!power || power.trim().length < FORM_LIMITS.powers.min) {
        return { powerTooShort: { min: FORM_LIMITS.powers.min } };
      }
      if (power.length > FORM_LIMITS.powers.max) {
        return { powerTooLong: { max: FORM_LIMITS.powers.max } };
      }
    }
    
    return null;
  };

  /**
   * Checks if a form field has validation errors and has been touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.heroForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  /**
   * Returns descriptive error message for a specific field
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.heroForm.get(fieldName);
    if (!field?.errors) return '';

    const errors = field.errors;
    const fieldLabel = FIELD_LABELS[fieldName] || 'Field';

    if (errors['required']) return `${fieldLabel} is required`;
    if (errors['minlength']) return `${fieldLabel} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${fieldLabel} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) return `${fieldLabel} contains invalid characters`;
    if (errors['min']) return `${fieldLabel} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${fieldLabel} cannot exceed ${errors['max'].max}`;
    
    // Powers array validation errors
    if (errors['invalidArray']) return `${fieldLabel} must be an array`;
    if (errors['arrayTooShort']) return `${fieldLabel} must have at least ${errors['arrayTooShort'].min} power(s)`;
    if (errors['arrayTooLong']) return `${fieldLabel} cannot have more than ${errors['arrayTooLong'].max} powers`;
    if (errors['powerTooShort']) return `Each power must be at least ${errors['powerTooShort'].min} characters`;
    if (errors['powerTooLong']) return `Each power cannot exceed ${errors['powerTooLong'].max} characters`;

    return 'Invalid field';
  }

  /**
   * Marks all form controls as touched to display validation errors
   */
  private markAllFieldsTouched(): void {
    Object.keys(this.heroForm.controls).forEach(key => {
      this.heroForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Handles form submission with validation and appropriate action
   */
  onSubmit(): void {
    if (!this.heroForm.valid) {
      this.markAllFieldsTouched();
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    this.isEditMode ? this.updateHero() : this.createHero();
  }

  /**
   * Creates a new hero with form data
   */
  private createHero(): void {
    const heroData = this.buildHeroCreateRequest();

    this.heroService.createHero(heroData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => this.handleServiceError('create', error))
      )
      .subscribe(result => {
        this.isLoading = false;
        if (result) {
          showSuccessMessage(this.snackBar, 'Hero created successfully');
          this.dialogRef.close(result);
        }
      });
  }

  /**
   * Updates existing hero with form data
   */
  private updateHero(): void {
    if (!this.data.hero) return;

    const heroData = this.buildHeroUpdateRequest();

    this.heroService.updateHero(heroData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => this.handleServiceError('update', error))
      )
      .subscribe(result => {
        this.isLoading = false;
        if (result) {
          showSuccessMessage(this.snackBar, 'Hero updated successfully');
          this.dialogRef.close(result);
        }
      });
  }

  /**
   * Cancels the operation and closes the dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Builds create request object from form data
   */
  private buildHeroCreateRequest(): HeroCreateRequest {
    const formValue = this.heroForm.value;
    const request: HeroCreateRequest = {
      name: formValue.name.trim(),
      alias: formValue.alias.trim(),
      city: formValue.city.trim(),
      description: formValue.description?.trim() || '',
      imageUrl: formValue.imageUrl?.trim() || '',
      powers: formValue.powers || [],
      powerLevel: formValue.powerLevel,
      isActive: formValue.isActive
    };
    // No enviar campos opcionales vacíos
    if (!request.description) delete (request as any).description;
    if (!request.imageUrl) delete (request as any).imageUrl;
    return request;
  }

  /**
   * Builds update request object from form data
   */
  private buildHeroUpdateRequest(): HeroUpdateRequest {
    const formValue = this.heroForm.value;
    const request: HeroUpdateRequest = {
      id: this.data.hero!.id,
      name: formValue.name.trim(),
      alias: formValue.alias.trim(),
      city: formValue.city.trim(),
      description: formValue.description?.trim() || '',
      imageUrl: formValue.imageUrl?.trim() || '',
      powers: formValue.powers || [],
      powerLevel: formValue.powerLevel,
      isActive: formValue.isActive
    };
    if (!request.description) delete (request as any).description;
    if (!request.imageUrl) delete (request as any).imageUrl;
    return request;
  }

  /**
   * Exposes FORM_LIMITS for template
   */
  readonly FORM_LIMITS = FORM_LIMITS;

  /**
   * Returns current date in YYYY-MM-DD format for date input max attribute
   */
  getCurrentDate(): string {
    return getCurrentDate();
  }

  /**
   * Adds a power from input field
   */
  addPowerFromInput(input: HTMLInputElement): void {
    const value = input.value.trim();
    const powers = (this.heroForm.get('powers')?.value as string[]) || [];

    if (value && !powers.includes(value) && powers.length < FORM_LIMITS.powers.arrayMax) {
      const next = [...powers, value];
      this.heroForm.get('powers')?.setValue(next);
      this.heroForm.get('powers')?.markAsTouched();
      input.value = '';
    }
  }

  /**
   * Removes a power from the powers array
   */
  removePower(index: number): void {
    const powers = (this.heroForm.get('powers')?.value as string[]) || [];
    if (index >= 0 && index < powers.length) {
      const next = powers.filter((_, i) => i !== index);
      this.heroForm.get('powers')?.setValue(next);
      this.heroForm.get('powers')?.markAsTouched();
    }
  }

  /**
   * Gets power level description
   */
  getPowerLevelDescription(level: number): string {
    if (level <= 3) return 'Principiante';
    if (level <= 6) return 'Intermedio';
    if (level <= 8) return 'Avanzado';
    return 'Élite';
  }

  /**
   * Gets color for power level display
   */
  getPowerLevelColor(powerLevel: number): 'primary' | 'accent' | 'warn' {
    if (powerLevel <= 3) return 'warn';
    if (powerLevel <= 6) return 'primary';
    return 'accent';
  }

  /**
   * Formats date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Handles service operation errors with consistent messaging
   */
  private handleServiceError(operation: 'create' | 'update', error: any) {
    this.isLoading = false;
    // Intentar extraer errores de validación del backend (class-validator)
    const backendErrors: any[] = error?.error?.message || [];
    if (Array.isArray(backendErrors) && backendErrors.length) {
      // Marcar campos y mostrar primer error relevante
      let shown = false;
      for (const message of backendErrors) {
        // Heurística para mapear mensajes a campos
        const map: Record<string, string> = {
          nombre: 'name',
          alias: 'alias',
          ciudad: 'city',
          descripcion: 'description',
          'nivel de poder': 'powerLevel',
          powers: 'powers',
          image: 'imageUrl',
          url: 'imageUrl'
        };
        const lower = String(message).toLowerCase();
        for (const key of Object.keys(map)) {
          if (lower.includes(key)) {
            const control = this.heroForm.get(map[key]);
            control?.setErrors({ backend: true });
            control?.markAsTouched();
            if (!shown) {
              showErrorMessage(this.snackBar, message);
              shown = true;
            }
          }
        }
      }
      if (!shown) {
        showErrorMessage(this.snackBar, backendErrors[0]);
      }
    } else {
      const action = operation === 'create' ? 'crear' : 'actualizar';
      const msg = error?.error?.message || error?.message || 'Error inesperado';
      showErrorMessage(this.snackBar, `Error al ${action} héroe: ${msg}`);
    }
    this.markAllFieldsTouched();
    return of(null);
  }
}
