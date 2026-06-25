import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CursoService } from '../../core/services/curso.service';
import { NotificationService } from '../../core/services/notification.service';
import { LookupService } from '../../core/services/lookup.service';
import { Curso } from '../../core/models';

@Component({
  selector: 'app-curso-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Novo' }} curso</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()">
      <mat-dialog-content class="form-grid">
        <mat-form-field>
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" />
          @if (form.controls.nome.hasError('required')) {
            <mat-error>Informe o nome</mat-error>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label>Sigla</mat-label>
          <input matInput formControlName="sigla" maxlength="10" />
          @if (form.controls.sigla.hasError('required')) {
            <mat-error>Informe a sigla</mat-error>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label>Código</mat-label>
          <input matInput formControlName="codigo" />
          @if (form.controls.codigo.hasError('required')) {
            <mat-error>Informe o código</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="salvando()">Salvar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .form-grid {
      display: flex;
      flex-direction: column;
      min-width: 360px;
    }
  `,
})
export class CursoFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(CursoService);
  private notify = inject(NotificationService);
  private lookup = inject(LookupService);
  private ref = inject(MatDialogRef<CursoFormComponent>);
  private data = inject<Curso | null>(MAT_DIALOG_DATA);

  protected readonly salvando = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    sigla: ['', Validators.required],
    codigo: ['', Validators.required],
  });

  protected get editando(): boolean {
    return this.data !== null;
  }

  constructor() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    const value = this.form.getRawValue();
    const req = this.data
      ? this.service.update(this.data.id, value)
      : this.service.create(value);
    req.subscribe({
      next: () => {
        this.notify.success(this.editando ? 'Curso atualizado.' : 'Curso criado.');
        this.lookup.carregar();
        this.ref.close(true);
      },
      error: () => this.salvando.set(false),
    });
  }
}
