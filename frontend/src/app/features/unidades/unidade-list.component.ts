import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { UnidadeAcademicaService } from '../../core/services/unidade-academica.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { NotificationService } from '../../core/services/notification.service';
import { UnidadeAcademica } from '../../core/models';
import { UnidadeFormComponent } from './unidade-form.component';

@Component({
  selector: 'app-unidade-list',
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
        <h1>Unidades Acadêmicas</h1>
        <button mat-flat-button (click)="abrirForm()">
          <mat-icon>add</mat-icon>
          Nova unidade
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="48" /></div>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Nenhuma unidade cadastrada.</p>
        </div>
      } @else {
        <mat-card appearance="outlined">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let u">{{ u.nome }}</td>
            </ng-container>
            <ng-container matColumnDef="sigla">
              <th mat-header-cell *matHeaderCellDef>Sigla</th>
              <td mat-cell *matCellDef="let u">{{ u.sigla }}</td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef class="col-acoes">Ações</th>
              <td mat-cell *matCellDef="let u" class="col-acoes">
                <button mat-icon-button (click)="abrirForm(u)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="excluir(u)" matTooltip="Excluir">
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
export class UnidadeListComponent implements OnInit {
  private service = inject(UnidadeAcademicaService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);
  private notify = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly colunas = ['nome', 'sigla', 'acoes'];
  protected readonly dataSource = new MatTableDataSource<UnidadeAcademica>([]);

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

  protected abrirForm(unidade?: UnidadeAcademica): void {
    this.dialog
      .open(UnidadeFormComponent, { data: unidade ?? null })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.carregar();
        }
      });
  }

  protected excluir(unidade: UnidadeAcademica): void {
    this.confirm
      .confirmar({
        titulo: 'Excluir unidade',
        mensagem: `Excluir "${unidade.nome}"? Esta ação não pode ser desfeita.`,
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.delete(unidade.id).subscribe(() => {
            this.notify.success('Unidade excluída.');
            this.carregar();
          });
        }
      });
  }
}
