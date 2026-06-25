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
import { AlunoService } from '../../core/services/aluno.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { NotificationService } from '../../core/services/notification.service';
import { LookupService } from '../../core/services/lookup.service';
import { Aluno } from '../../core/models';
import { AlunoFormComponent } from './aluno-form.component';

@Component({
  selector: 'app-aluno-list',
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
        <h1>Alunos</h1>
        <button mat-flat-button (click)="abrirForm()">
          <mat-icon>add</mat-icon>
          Novo aluno
        </button>
      </div>

      <mat-form-field appearance="outline" class="busca">
        <mat-label>Buscar</mat-label>
        <input matInput (input)="buscar($event)" placeholder="Nome ou matrícula" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="48" /></div>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Nenhum aluno encontrado.</p>
        </div>
      } @else {
        <mat-card appearance="outlined">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let a">{{ a.nome }}</td>
            </ng-container>
            <ng-container matColumnDef="matricula">
              <th mat-header-cell *matHeaderCellDef>Matrícula</th>
              <td mat-cell *matCellDef="let a">{{ a.matricula }}</td>
            </ng-container>
            <ng-container matColumnDef="curso">
              <th mat-header-cell *matHeaderCellDef>Curso</th>
              <td mat-cell *matCellDef="let a">{{ lookup.nomeCurso(a.curso) }}</td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef class="col-acoes">Ações</th>
              <td mat-cell *matCellDef="let a" class="col-acoes">
                <button mat-icon-button (click)="abrirForm(a)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="excluir(a)" matTooltip="Excluir">
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
export class AlunoListComponent implements OnInit {
  private service = inject(AlunoService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);
  private notify = inject(NotificationService);
  protected lookup = inject(LookupService);

  protected readonly loading = signal(true);
  protected readonly colunas = ['nome', 'matricula', 'curso', 'acoes'];
  protected readonly dataSource = new MatTableDataSource<Aluno>([]);

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

  protected abrirForm(aluno?: Aluno): void {
    this.dialog
      .open(AlunoFormComponent, { data: aluno ?? null })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.carregar(this.termoAtual);
        }
      });
  }

  protected excluir(aluno: Aluno): void {
    this.confirm
      .confirmar({
        titulo: 'Excluir aluno',
        mensagem: `Excluir "${aluno.nome}"? Esta ação não pode ser desfeita.`,
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.delete(aluno.id).subscribe(() => {
            this.notify.success('Aluno excluído.');
            this.carregar(this.termoAtual);
          });
        }
      });
  }
}
