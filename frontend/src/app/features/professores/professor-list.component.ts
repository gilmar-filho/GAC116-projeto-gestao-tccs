import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ProfessorService } from '../../core/services/professor.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { NotificationService } from '../../core/services/notification.service';
import { LookupService } from '../../core/services/lookup.service';
import { Professor } from '../../core/models';
import { ProfessorFormComponent } from './professor-form.component';

@Component({
  selector: 'app-professor-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Professores</h1>
        <button mat-flat-button (click)="abrirForm()">
          <mat-icon>add</mat-icon>
          Novo professor
        </button>
      </div>

      <mat-form-field appearance="outline" class="busca">
        <mat-label>Buscar</mat-label>
        <input matInput (input)="buscar($event)" placeholder="Nome" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="48" /></div>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Nenhum professor encontrado.</p>
        </div>
      } @else {
        <mat-card appearance="outlined">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let p">{{ p.nome }}</td>
            </ng-container>
            <ng-container matColumnDef="departamento">
              <th mat-header-cell *matHeaderCellDef>Departamento</th>
              <td mat-cell *matCellDef="let p">{{ lookup.nomeDepartamento(p.departamento) }}</td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef class="col-acoes">Ações</th>
              <td mat-cell *matCellDef="let p" class="col-acoes">
                <button mat-icon-button (click)="abrirForm(p)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="excluir(p)" matTooltip="Excluir">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="colunas"></tr>
            <tr mat-row *matRowDef="let row; columns: colunas"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[5, 10, 25]" [pageSize]="10" />
        </mat-card>
      }
    </div>
  `,
  styles: `
    table { width: 100%; }
    .busca { width: 100%; max-width: 360px; margin-bottom: 8px; }
    .col-acoes { width: 120px; text-align: right; }
  `,
})
export class ProfessorListComponent implements OnInit {
  private service = inject(ProfessorService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);
  private notify = inject(NotificationService);
  protected lookup = inject(LookupService);

  protected readonly loading = signal(true);
  protected readonly colunas = ['nome', 'departamento', 'acoes'];
  protected readonly dataSource = new MatTableDataSource<Professor>([]);

  private readonly termo$ = new Subject<string>();
  private termoAtual = '';

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) {
      this.dataSource.paginator = p;
    }
  }

  constructor() {
    this.termo$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((t) => this.carregar(t));
  }

  ngOnInit(): void {
    this.carregar('');
  }

  protected buscar(event: Event): void {
    this.termoAtual = (event.target as HTMLInputElement).value.trim();
    this.termo$.next(this.termoAtual);
  }

  private carregar(termo: string): void {
    this.loading.set(true);
    const req = termo ? this.service.search(termo) : this.service.getAll();
    req.subscribe({
      next: (dados) => {
        this.dataSource.data = dados;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected abrirForm(professor?: Professor): void {
    this.dialog
      .open(ProfessorFormComponent, { data: professor ?? null })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.carregar(this.termoAtual);
        }
      });
  }

  protected excluir(professor: Professor): void {
    this.confirm
      .confirmar({
        titulo: 'Excluir professor',
        mensagem: `Excluir "${professor.nome}"? Esta ação não pode ser desfeita.`,
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.delete(professor.id).subscribe(() => {
            this.notify.success('Professor excluído.');
            this.carregar(this.termoAtual);
          });
        }
      });
  }
}
