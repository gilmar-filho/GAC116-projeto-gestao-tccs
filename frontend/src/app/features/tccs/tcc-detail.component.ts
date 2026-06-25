import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LookupService } from '../../core/services/lookup.service';
import { TccService } from '../../core/services/tcc.service';
import { TCC } from '../../core/models';

@Component({
  selector: 'app-tcc-detail',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ tcc.titulo }}</h2>
    <mat-dialog-content class="detalhe">
      <p><strong>Resumo:</strong> {{ tcc.resumo }}</p>
      <p><strong>Palavras-chave:</strong> {{ tcc.palavras_chave }}</p>
      <div class="grid">
        <span><strong>Tipo:</strong> {{ tcc.tipo_display }}</span>
        <span><strong>Idioma:</strong> {{ tcc.idioma_display }}</span>
        <span><strong>Status:</strong> {{ tcc.status_display }}</span>
        <span><strong>Semestre:</strong> {{ tcc.semestre_letivo_defesa ?? '—' }}</span>
        <span><strong>Aluno:</strong> {{ lookup.nomeAluno(tcc.aluno) }}</span>
        <span><strong>Orientador:</strong> {{ lookup.nomeProfessor(tcc.orientador) }}</span>
        <span><strong>Coorientador:</strong> {{ lookup.nomeProfessor(tcc.coorientador) }}</span>
        <span><strong>Presidente:</strong> {{ lookup.nomeProfessor(tcc.presidente) }}</span>
        <span><strong>1º membro:</strong> {{ lookup.nomeProfessor(tcc.primeiro_membro) }}</span>
        <span><strong>2º membro:</strong> {{ lookup.nomeProfessor(tcc.segundo_membro) }}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (arquivoUrl) {
        <a mat-stroked-button [href]="arquivoUrl" target="_blank" rel="noopener">
          <mat-icon>download</mat-icon>
          Baixar arquivo
        </a>
      }
      <button mat-flat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .detalhe { min-width: 380px; max-width: 560px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      margin-top: 8px;
    }
  `,
})
export class TccDetailComponent {
  protected lookup = inject(LookupService);
  private tccService = inject(TccService);
  protected tcc = inject<TCC>(MAT_DIALOG_DATA);

  protected get arquivoUrl(): string | null {
    return this.tccService.arquivoUrl(this.tcc);
  }
}
