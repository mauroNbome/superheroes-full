import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, BrowserAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title', () => {
    expect(component.title).toBe('Súper Héroes App');
  });

  it('should display title in template', () => {
    const titleElement = fixture.debugElement.query(By.css('.app-title'));
    expect(titleElement.nativeElement.textContent).toContain('Súper Héroes App');
  });

  it('should display custom title when provided', () => {
    const customTitle = 'Custom Heroes App';
    component.title = customTitle;
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.app-title'));
    expect(titleElement.nativeElement.textContent).toContain(customTitle);
  });

  // UI actual no incluye logo icono
  it('should render title only in logo section', () => {
    const logoSection = fixture.debugElement.query(By.css('.logo-section'));
    expect(logoSection).toBeTruthy();
    const appTitle = logoSection.query(By.css('.app-title'));
    expect(appTitle).toBeTruthy();
  });

  it('should render header toolbar', () => {
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar'));
    expect(toolbar).toBeTruthy();
    expect(toolbar.nativeElement).toHaveClass('app-header');
  });

  it('should render header content container', () => {
    const headerContent = fixture.debugElement.query(By.css('.header-content'));
    expect(headerContent).toBeTruthy();
  });

  // La UI actual no tiene logo-section, solo título dentro del toolbar
  it('should display title in toolbar', () => {
    const titleElement = fixture.debugElement.query(By.css('.app-title'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent).toContain(component.title);
  });

  it('should render header actions', () => {
    const headerActions = fixture.debugElement.query(By.css('.header-actions'));
    expect(headerActions).toBeTruthy();
    const buttons = headerActions.queryAll(By.css('button'));
    expect(buttons.length).toBe(1); // Solo toggle de tema
  });

  it('should render theme toggle button', () => {
    const themeToggleBtn = fixture.debugElement.query(By.css('[data-testid="theme-toggle-btn"]'));
    expect(themeToggleBtn).toBeTruthy();
    
    const icon = themeToggleBtn.query(By.css('mat-icon'));
    // El icono puede ser 'dark_mode' o 'light_mode' dependiendo del estado
    expect(['dark_mode', 'light_mode']).toContain(icon.nativeElement.textContent);
  });

  // La UI actual no tiene settings ni profile
  it('should not render settings/profile buttons in current UI', () => {
    const settingsBtn = fixture.debugElement.query(By.css('[data-testid="settings-btn"]'));
    const profileBtn = fixture.debugElement.query(By.css('[data-testid="profile-btn"]'));
    expect(settingsBtn).toBeNull();
    expect(profileBtn).toBeNull();
  });

  it('should call onThemeToggle when theme toggle button is clicked', () => {
    spyOn(component, 'onThemeToggle');
    
    const themeToggleBtn = fixture.debugElement.query(By.css('[data-testid="theme-toggle-btn"]'));
    themeToggleBtn.nativeElement.click();
    
    expect(component.onThemeToggle).toHaveBeenCalled();
  });

  // Botones no presentes, omitimos handlers

  it('should toggle theme when theme toggle button is clicked', () => {
    spyOn(component.themeService, 'toggleTheme');
    
    component.onThemeToggle();
    
    expect(component.themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should log to console when settings button is clicked', () => {
    spyOn(console, 'log');
    
    component.onSettingsClick();
    
    expect(console.log).toHaveBeenCalledWith('Settings clicked');
  });

  it('should log to console when profile button is clicked', () => {
    spyOn(console, 'log');
    
    component.onProfileClick();
    
    expect(console.log).toHaveBeenCalledWith('Profile clicked');
  });

  // Tooltips específicos de settings/profile no aplican en UI actual

  it('should have proper CSS classes', () => {
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar'));
    const headerContent = fixture.debugElement.query(By.css('.header-content'));
    const logoSection = fixture.debugElement.query(By.css('.logo-section'));
    const headerActions = fixture.debugElement.query(By.css('.header-actions'));
    
    expect(toolbar.nativeElement).toHaveClass('app-header');
    expect(headerContent.nativeElement).toHaveClass('header-content');
    expect(logoSection.nativeElement).toHaveClass('logo-section');
    expect(headerActions.nativeElement).toHaveClass('header-actions');
  });

  it('should accept title as input property', () => {
    const testTitle = 'Test Title';
    component.title = testTitle;
    fixture.detectChanges();
    
    expect(component.title).toBe(testTitle);
    
    const titleElement = fixture.debugElement.query(By.css('.app-title'));
    expect(titleElement.nativeElement.textContent).toContain(testTitle);
  });
}); 