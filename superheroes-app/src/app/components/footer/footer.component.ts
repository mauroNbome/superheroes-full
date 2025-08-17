import { Component, Input } from '@angular/core';
import { MaterialModule } from '@shared/material.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  @Input() title: string = 'Súper Héroes App';
  @Input() currentYear: number = new Date().getFullYear();

  onAboutClick(): void {
    console.log('About clicked');
  }

  onHelpClick(): void {
    console.log('Help clicked');
  }

  onGithubClick(): void {
    console.log('GitHub clicked');
    window.open('https://github.com', '_blank');
  }
}
