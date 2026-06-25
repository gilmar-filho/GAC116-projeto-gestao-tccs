import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TccService } from '../../core/services/tcc.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { NotificationService } from '../../core/services/notification.service';
import { LookupService } from '../../core/services/lookup.service';
import { STATUS_OPCOES, StatusTCC, TCC } from '../../core/models';
import { TccFormComponent } from './tcc-form.component';
import { TccDetailComponent } from './tcc-detail.component';

const STATUS_CORES: Record<StatusTCC, string> = {
  '0': '#f9a825',
  '1': '#1e88e5',
  '2': '#2e7d32',
  '3': '#c62828',
};

@Component({
  selector: 'app-tcc-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>TCCs</h1>
        <button mat-flat-button (click)="abrirForm()">
          <mat-icon>add</mat-icon>
          Novo TCC
        </button>
      </div>

      <div class="filtros">
        <mat-form-field appearance="outline" class="busca">
          <mat-label>Buscar por título</mat-label>
          <input matInput (input)="buscar($event)" placeholder="Título" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-button-toggle-group
          [value]="statusFiltro()"
          (change)="filtrarStatus($event.value)"
          hideSingleSelectionIndicator
        >
          <mat-button-toggle value="">Todos</mat-button-toggle>
          @for (s of statusOpcoes; track s.value) {
            <mat-button-toggle [value]="s.value">{{ s.label }}</mat-button-toggle>
          }
        </mat-button-toggle-group>
      </div>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="48" /></div>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Nenhum TCC encontrado.</p>
        </div>
      } @else {
        <mat-card appearance="outlined">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="titulo">
              <th mat-header-cell *matHeaderCellDef>Título</th>
              <td mat-cell *matCellDef="let t">{{ t.titulo }}</td>
            </ng-container>
            <ng-container matColumnDef="aluno">
              <th mat-header-cell *matHeaderCellDef>Aluno</th>
              <td mat-cell *matCellDef="let t">{{ lookup.nomeAluno(t.aluno) }}</td>
            </ng-container>
            <ng-container matColumnDef="orientador">
              <th mat-header-cell *matHeaderCellDef>Orientador</th>
              <td mat-cell *matCellDef="let t">{{ lookup.nomeProfessor(t.orientador) }}</td>
            </ng-container>
            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let t">{{ t.tipo_display }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t">
                <span class="status-chip" [style.backgroundColor]="cor(t.status)">
                  {{ t.status_display }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef class="col-acoes">Ações</th>
              <td mat-cell *matCellDef="let t" class="col-acoes">
                <button mat-icon-button (click)="verDetalhe(t)" matTooltip="Detalhes">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="abrirForm(t)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="excluir(t)" matTooltip="Excluir">
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
    .filtros {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }
    .busca { width: 100%; max-width: 320px; }
    .col-acoes { width: 160px; text-align: right; }
    .status-chip {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      color: #fff;
      font-size: 0.8rem;
      white-space: nowrap;
    }
  `,
})
export class TccListComponent implements OnInit {
  private service = inject(TccService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);
  private notify = inject(NotificationService);
  protected lookup = inject(LookupService);

  protected readonly loading = signal(true);
  protected readonly statusFiltro = signal<string>('');
  protected readonly statusOpcoes = STATUS_OPCOES;
  protected readonly colunas = ['titulo', 'aluno', 'orientador', 'tipo', 'status', 'acoes'];
  protected readonly dataSource = new MatTableDataSource<TCC>([]);

  private todos: TCC[] = [];
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

  protected cor(status: StatusTCC): string {
    return STATUS_CORES[status];
  }

  protected buscar(event: Event): void {
    this.termoAtual = (event.target as HTMLInputElement).value.trim();
    this.termo$.next(this.termoAtual);
  }

  protected filtrarStatus(status: string): void {
    this.statusFiltro.set(status);
    this.aplicarFiltro();
  }

  private carregar(termo: string): void {
    this.loading.set(true);
    const req = termo ? this.service.search(termo) : this.service.getAll();
    req.subscribe({
      next: (dados) => {
        this.todos = dados;
        this.aplicarFiltro();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private aplicarFiltro(): void {
    const status = this.statusFiltro();
    this.dataSource.data = status ? this.todos.filter((t) => t.status === status) : this.todos;
  }

  protected abrirForm(tcc?: TCC): void {
    this.dialog
      .open(TccFormComponent, { data: tcc ?? null, width: '640px' })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.carregar(this.termoAtual);
        }
      });
  }

  protected verDetalhe(tcc: TCC): void {
    this.dialog.open(TccDetailComponent, { data: tcc, width: '600px' });
  }

  protected excluir(tcc: TCC): void {
    this.confirm
      .confirmar({
        titulo: 'Excluir TCC',
        mensagem: `Excluir "${tcc.titulo}"? Esta ação não pode ser desfeita.`,
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.delete(tcc.id).subscribe(() => {
            this.notify.success('TCC excluído.');
            this.carregar(this.termoAtual);
          });
        }
      });
  }
}
