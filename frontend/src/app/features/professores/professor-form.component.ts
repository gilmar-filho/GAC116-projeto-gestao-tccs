import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ProfessorService } from '../../core/services/professor.service';
import { NotificationService } from '../../core/services/notification.service';
import { LookupService } from '../../core/services/lookup.service';
import { Professor } from '../../core/models';

@Component({
  selector: 'app-professor-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Novo' }} professor</h2>
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
          <mat-label>Departamento</mat-label>
          <mat-select formControlName="departamento">
            @for (d of lookup.departamentos(); track d.id) {
              <mat-option [value]="d.id">{{ d.nome }}</mat-option>
            }
          </mat-select>
          @if (form.controls.departamento.hasError('required')) {
            <mat-error>Selecione o departamento</mat-error>
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
export class ProfessorFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(ProfessorService);
  private notify = inject(NotificationService);
  protected lookup = inject(LookupService);
  private ref = inject(MatDialogRef<ProfessorFormComponent>);
  private data = inject<Professor | null>(MAT_DIALOG_DATA);

  protected readonly salvando = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    departamento: [null as number | null, Validators.required],
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
    const raw = this.form.getRawValue();
    const value = { ...raw, departamento: raw.departamento! };
    const req = this.data
      ? this.service.update(this.data.id, value)
      : this.service.create(value);
    req.subscribe({
      next: () => {
        this.notify.success(this.editando ? 'Professor atualizado.' : 'Professor criado.');
        this.lookup.carregar();
        this.ref.close(true);
      },
      error: () => this.salvando.set(false),
    });
  }
}
