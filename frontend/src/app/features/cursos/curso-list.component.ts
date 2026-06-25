import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { CursoService } from '../../core/services/curso.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { NotificationService } from '../../core/services/notification.service';
import { Curso } from '../../core/models';
import { CursoFormComponent } from './curso-form.component';

@Component({
  selector: 'app-curso-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Cursos</h1>
        <button mat-flat-button (click)="abrirForm()">
          <mat-icon>add</mat-icon>
          Novo curso
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="48" /></div>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Nenhum curso cadastrado.</p>
        </div>
      } @else {
        <mat-card appearance="outlined">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let c">{{ c.nome }}</td>
            </ng-container>
            <ng-container matColumnDef="sigla">
              <th mat-header-cell *matHeaderCellDef>Sigla</th>
              <td mat-cell *matCellDef="let c">{{ c.sigla }}</td>
            </ng-container>
            <ng-container matColumnDef="codigo">
              <th mat-header-cell *matHeaderCellDef>Código</th>
              <td mat-cell *matCellDef="let c">{{ c.codigo }}</td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef class="col-acoes">Ações</th>
              <td mat-cell *matCellDef="let c" class="col-acoes">
                <button mat-icon-button (click)="abrirForm(c)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="excluir(c)" matTooltip="Excluir">
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
    .col-acoes { width: 120px; text-align: right; }
  `,
})
export class CursoListComponent implements OnInit {
  private service = inject(CursoService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);
  private notify = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly colunas = ['nome', 'sigla', 'codigo', 'acoes'];
  protected readonly dataSource = new MatTableDataSource<Curso>([]);

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) {
      this.dataSource.paginator = p;
    }
  }

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (dados) => {
        this.dataSource.data = dados;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected abrirForm(curso?: Curso): void {
    this.dialog
      .open(CursoFormComponent, { data: curso ?? null })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.carregar();
        }
      });
  }

  protected excluir(curso: Curso): void {
    this.confirm
      .confirmar({
        titulo: 'Excluir curso',
        mensagem: `Excluir "${curso.nome}"? Esta ação não pode ser desfeita.`,
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.delete(curso.id).subscribe(() => {
            this.notify.success('Curso excluído.');
            this.carregar();
          });
        }
      });
  }
}
