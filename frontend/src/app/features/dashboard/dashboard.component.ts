import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { EstatisticasService } from '../../core/services/estatisticas.service';
import { EstatisticasTCC } from '../../core/models';

const STATUS_CORES: Record<string, string> = {
  'Em Elaboração': '#f9a825',
  Enviado: '#1e88e5',
  Aprovado: '#2e7d32',
  Reprovado: '#c62828',
};

const PALETA = [
  '#2e7d32', '#43a047', '#66bb6a', '#1b5e20', '#81c784',
  '#388e3c', '#00897b', '#4db6ac', '#26a69a', '#a5d6a7',
];

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private service = inject(EstatisticasService);

  protected readonly estat = signal<EstatisticasTCC | null>(null);
  protected readonly loading = signal(true);

  protected readonly cards = computed(() => {
    const e = this.estat();
    if (!e) {
      return [];
    }
    return [
      { label: 'Total de TCCs', valor: e.total_geral, icon: 'description', cor: '#2e7d32' },
      { label: 'Aprovados', valor: e.por_status['Aprovado'] ?? 0, icon: 'verified', cor: '#2e7d32' },
      { label: 'Enviados', valor: e.por_status['Enviado'] ?? 0, icon: 'outbox', cor: '#1e88e5' },
      { label: 'Em Elaboração', valor: e.por_status['Em Elaboração'] ?? 0, icon: 'edit_note', cor: '#f9a825' },
    ];
  });

  protected readonly statusChart = computed<ChartData<'doughnut'>>(() => {
    const entries = Object.entries(this.estat()?.por_status ?? {});
    return {
      labels: entries.map(([k]) => k),
      datasets: [
        {
          data: entries.map(([, v]) => v),
          backgroundColor: entries.map(([k]) => STATUS_CORES[k] ?? '#90a4ae'),
        },
      ],
    };
  });

  protected readonly tipoChart = computed<ChartData<'pie'>>(() => {
    const entries = Object.entries(this.estat()?.por_tipo ?? {});
    return {
      labels: entries.map(([k]) => k),
      datasets: [{ data: entries.map(([, v]) => v), backgroundColor: PALETA }],
    };
  });

  protected readonly semestreChart = computed<ChartData<'bar'>>(() => {
    const entries = Object.entries(this.estat()?.por_semestre ?? {}).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    return {
      labels: entries.map(([k]) => k),
      datasets: [{ label: 'TCCs', data: entries.map(([, v]) => v), backgroundColor: '#2e7d32' }],
    };
  });

  protected readonly orientadoresChart = computed<ChartData<'bar'>>(() => {
    const entries = Object.entries(this.estat()?.por_orientador ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return {
      labels: entries.map(([k]) => k),
      datasets: [{ label: 'Orientações', data: entries.map(([, v]) => v), backgroundColor: '#388e3c' }],
    };
  });

  protected readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  protected readonly pieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  protected readonly barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  protected readonly barHorizontalOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  ngOnInit(): void {
    this.service.getEstatisticas().subscribe({
      next: (data) => {
        this.estat.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
