import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DepartamentoService } from '../../core/services/departamento.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { NotificationService } from '../../core/services/notification.service';
import { LookupService } from '../../core/services/lookup.service';
import { Departamento } from '../../core/models';
import { DepartamentoFormComponent } from './departamento-form.component';

@Component({
  selector: 'app-departamento-list',
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
        <h1>Departamentos</h1>
        <button mat-flat-button (click)="abrirForm()">
          <mat-icon>add</mat-icon>
          Novo departamento
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="48" /></div>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Nenhum departamento cadastrado.</p>
        </div>
      } @else {
        <mat-card appearance="outlined">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let d">{{ d.nome }}</td>
            </ng-container>
            <ng-container matColumnDef="sigla">
              <th mat-header-cell *matHeaderCellDef>Sigla</th>
              <td mat-cell *matCellDef="let d">{{ d.sigla }}</td>
            </ng-container>
            <ng-container matColumnDef="unidade">
              <th mat-header-cell *matHeaderCellDef>Unidade</th>
              <td mat-cell *matCellDef="let d">{{ lookup.nomeUnidade(d.unidade_academica) }}</td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef class="col-acoes">Ações</th>
              <td mat-cell *matCellDef="let d" class="col-acoes">
                <button mat-icon-button (click)="abrirForm(d)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="excluir(d)" matTooltip="Excluir">
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
export class DepartamentoListComponent implements OnInit {
  private service = inject(DepartamentoService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);
  private notify = inject(NotificationService);
  protected lookup = inject(LookupService);

  protected readonly loading = signal(true);
  protected readonly colunas = ['nome', 'sigla', 'unidade', 'acoes'];
  protected readonly dataSource = new MatTableDataSource<Departamento>([]);

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

  protected abrirForm(departamento?: Departamento): void {
    this.dialog
      .open(DepartamentoFormComponent, { data: departamento ?? null })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.carregar();
        }
      });
  }

  protected excluir(departamento: Departamento): void {
    this.confirm
      .confirmar({
        titulo: 'Excluir departamento',
        mensagem: `Excluir "${departamento.nome}"? Esta ação não pode ser desfeita.`,
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.delete(departamento.id).subscribe(() => {
            this.notify.success('Departamento excluído.');
            this.carregar();
          });
        }
      });
  }
}
