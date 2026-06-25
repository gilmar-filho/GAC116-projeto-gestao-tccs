import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TccService } from '../../core/services/tcc.service';
import { NotificationService } from '../../core/services/notification.service';
import { LookupService } from '../../core/services/lookup.service';
import {
  IDIOMA_OPCOES,
  STATUS_OPCOES,
  SEMESTRE_OPCOES,
  TIPO_OPCOES,
  TCC,
  IdiomaTCC,
  StatusTCC,
  TipoTCC,
} from '../../core/models';

@Component({
  selector: 'app-tcc-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Novo' }} TCC</h2>
    <mat-dialog-content>
      <mat-stepper [linear]="!editando" #stepper>
        <mat-step [stepControl]="form.controls.dados" label="Dados gerais">
          <div [formGroup]="form">
            <div formGroupName="dados" class="form-grid">
              <mat-form-field class="col-2">
                <mat-label>Título</mat-label>
                <input matInput formControlName="titulo" />
              </mat-form-field>
              <mat-form-field class="col-2">
                <mat-label>Resumo</mat-label>
                <textarea matInput formControlName="resumo" rows="3"></textarea>
              </mat-form-field>
              <mat-form-field class="col-2">
                <mat-label>Palavras-chave</mat-label>
                <input matInput formControlName="palavras_chave" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Tipo</mat-label>
                <mat-select formControlName="tipo">
                  @for (t of tipos; track t.value) {
                    <mat-option [value]="t.value">{{ t.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Idioma</mat-label>
                <mat-select formControlName="idioma">
                  @for (i of idiomas; track i.value) {
                    <mat-option [value]="i.value">{{ i.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  @for (s of statusOpcoes; track s.value) {
                    <mat-option [value]="s.value">{{ s.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Semestre de defesa</mat-label>
                <mat-select formControlName="semestre_letivo_defesa">
                  <mat-option [value]="null">—</mat-option>
                  @for (sem of semestres; track sem) {
                    <mat-option [value]="sem">{{ sem }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Aluno</mat-label>
                <mat-select formControlName="aluno">
                  @for (a of lookup.alunos(); track a.id) {
                    <mat-option [value]="a.id">{{ a.nome }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Orientador</mat-label>
                <mat-select formControlName="orientador">
                  @for (p of lookup.professores(); track p.id) {
                    <mat-option [value]="p.id">{{ p.nome }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Coorientador (opcional)</mat-label>
                <mat-select formControlName="coorientador">
                  <mat-option [value]="null">—</mat-option>
                  @for (p of lookup.professores(); track p.id) {
                    <mat-option [value]="p.id">{{ p.nome }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          <div class="step-actions">
            <button mat-button type="button" mat-dialog-close>Cancelar</button>
            <button mat-flat-button matStepperNext type="button">Próximo</button>
          </div>
        </mat-step>

        <mat-step [stepControl]="form.controls.banca" label="Banca e arquivo">
          <div [formGroup]="form">
            <div formGroupName="banca" class="form-grid">
              <mat-form-field>
                <mat-label>Presidente</mat-label>
                <mat-select formControlName="presidente">
                  @for (p of lookup.professores(); track p.id) {
                    <mat-option [value]="p.id">{{ p.nome }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>1º membro</mat-label>
                <mat-select formControlName="primeiro_membro">
                  @for (p of lookup.professores(); track p.id) {
                    <mat-option [value]="p.id">{{ p.nome }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>2º membro</mat-label>
                <mat-select formControlName="segundo_membro">
                  @for (p of lookup.professores(); track p.id) {
                    <mat-option [value]="p.id">{{ p.nome }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          <div class="upload">
            <button mat-stroked-button type="button" (click)="fileInput.click()">
              <mat-icon>upload_file</mat-icon>
              {{ arquivo() ? arquivo()!.name : 'Selecionar PDF (opcional)' }}
            </button>
            <input #fileInput type="file" accept="application/pdf" hidden (change)="onFile($event)" />
          </div>
          <div class="step-actions">
            <button mat-button matStepperPrevious type="button">Voltar</button>
            <button mat-flat-button type="button" (click)="salvar()" [disabled]="salvando()">
              Salvar
            </button>
          </div>
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>
  `,
  styles: `
    mat-dialog-content { padding-top: 8px; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0 16px;
      min-width: 520px;
    }
    .col-2 { grid-column: 1 / -1; }
    .upload { margin: 8px 0 16px; }
    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `,
})
export class TccFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(TccService);
  private notify = inject(NotificationService);
  protected lookup = inject(LookupService);
  private ref = inject(MatDialogRef<TccFormComponent>);
  private data = inject<TCC | null>(MAT_DIALOG_DATA);

  protected readonly tipos = TIPO_OPCOES;
  protected readonly idiomas = IDIOMA_OPCOES;
  protected readonly statusOpcoes = STATUS_OPCOES;
  protected readonly semestres = SEMESTRE_OPCOES;

  protected readonly salvando = signal(false);
  protected readonly arquivo = signal<File | null>(null);

  protected readonly form = this.fb.group({
    dados: this.fb.nonNullable.group({
      titulo: ['', Validators.required],
      resumo: ['', Validators.required],
      palavras_chave: ['', Validators.required],
      tipo: ['MONOGRAFIA' as TipoTCC, Validators.required],
      idioma: ['PT' as IdiomaTCC, Validators.required],
      status: ['0' as StatusTCC, Validators.required],
      semestre_letivo_defesa: [null as string | null],
      aluno: [null as number | null, Validators.required],
      orientador: [null as number | null, Validators.required],
      coorientador: [null as number | null],
    }),
    banca: this.fb.nonNullable.group({
      presidente: [null as number | null, Validators.required],
      primeiro_membro: [null as number | null, Validators.required],
      segundo_membro: [null as number | null, Validators.required],
    }),
  });

  protected get editando(): boolean {
    return this.data !== null;
  }

  constructor() {
    if (this.data) {
      this.form.controls.dados.patchValue(this.data);
      this.form.controls.banca.patchValue(this.data);
    }
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.arquivo.set(input.files?.[0] ?? null);
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    const dados = this.form.controls.dados.getRawValue();
    const banca = this.form.controls.banca.getRawValue();
    const payload = {
      titulo: dados.titulo,
      resumo: dados.resumo,
      palavras_chave: dados.palavras_chave,
      tipo: dados.tipo,
      idioma: dados.idioma,
      status: dados.status,
      semestre_letivo_defesa: dados.semestre_letivo_defesa,
      aluno: dados.aluno!,
      orientador: dados.orientador!,
      coorientador: dados.coorientador,
      presidente: banca.presidente!,
      primeiro_membro: banca.primeiro_membro!,
      segundo_membro: banca.segundo_membro!,
    };
    const arquivo = this.arquivo();
    const req = arquivo
      ? this.data
        ? this.service.patchWithFile(this.data.id, this.toFormData(payload, arquivo))
        : this.service.createWithFile(this.toFormData(payload, arquivo))
      : this.data
        ? this.service.patch(this.data.id, payload)
        : this.service.create(payload);
    req.subscribe({
      next: () => {
        this.notify.success(this.editando ? 'TCC atualizado.' : 'TCC criado.');
        this.ref.close(true);
      },
      error: () => this.salvando.set(false),
    });
  }

  private toFormData(payload: Record<string, unknown>, arquivo: File): FormData {
    const fd = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        fd.append(key, String(value));
      }
    });
    fd.append('arquivo', arquivo);
    return fd;
  }
}
