import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './core/services/theme.service';
import { LookupService } from './core/services/lookup.service';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  disponivel: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private breakpoints = inject(BreakpointObserver);
  private lookup = inject(LookupService);
  protected theme = inject(ThemeService);

  protected readonly isHandset = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', link: '/dashboard', disponivel: true },
    { label: 'TCCs', icon: 'description', link: '/tccs', disponivel: false },
    { label: 'Alunos', icon: 'school', link: '/alunos', disponivel: false },
    { label: 'Professores', icon: 'groups', link: '/professores', disponivel: false },
    { label: 'Cursos', icon: 'menu_book', link: '/cursos', disponivel: true },
    { label: 'Departamentos', icon: 'apartment', link: '/departamentos', disponivel: true },
    { label: 'Unidades', icon: 'account_balance', link: '/unidades', disponivel: true },
  ];

  ngOnInit(): void {
    this.lookup.carregar();
  }
}
