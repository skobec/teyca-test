import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ClientsService } from '../../core/services/clients.service';
import { Client } from '../../core/models/client.models';
import { SendPushModalComponent } from '../push/send-push-modal/send-push-modal.component';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();
  private readonly clientsService = inject(ClientsService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly clients = signal<Client[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly searchForm = this.fb.nonNullable.group({
    query: ['']
  });

  readonly selectedClients = signal<Client[]>([]);
  readonly displayedColumns = ['select', 'id', 'template', 'ownerName', 'phone', 'bonus', 'barcode', 'link', 'o_s'];

  private buildSearchQuery(query: string): string | undefined {
    if (!query?.trim()) return undefined;

    const value = query.trim();

    if (value.includes('=')) return value;

    const digits = value.replace(/\D/g, '');
    if (/^7?\d{10,11}$/.test(digits)) {
      const normalized = digits.startsWith('7') ? digits : '7' + digits;
      return `phone=${normalized}`;
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `email=${value}`;
    }

    if (/^\d{5,}$/.test(value)) {
      return `barcode=${value}`;
    }

    return `template=${value}`;
  }
  ngOnInit(): void {
    this.searchForm.controls.query.valueChanges.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.pageIndex.set(0);
      this.loadClients();
    });

    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.error.set(null);

    const rawQuery = this.searchForm.controls.query.value;
    const searchParam = this.buildSearchQuery(rawQuery);

    this.clientsService.getClients(
      this.pageIndex() + 1,
      this.pageSize(),
      searchParam
    ).subscribe({
      next: (response) => {
        this.clients.set(response.data || []);
        this.total.set(response.total || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.error.set('Ошибка загрузки');
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadClients();
  }

  toggleRowSelection(client: Client): void {
    const id = client['id'] || client['user_id'];
    const index = this.selectedClients().findIndex(c => (c['id'] || c['user_id']) === id);
    if (index === -1) {
      this.selectedClients.update(clients => [...clients, client]);
    } else {
      this.selectedClients.update(clients => clients.filter(c => (c['id'] || c['user_id']) !== id));
    }
  }

  toggleAllSelection(): void {
    if (this.selectedClients().length === this.clients().length) {
      this.selectedClients.set([]);
    } else {
      this.selectedClients.set(this.clients());
    }
  }

  openSendPushModal(): void {
    const selected = this.selectedClients().length > 0 ? this.selectedClients() : [];

    if (selected.length === 0) {
      alert('Выберите хотя бы одного клиента');
      return;
    }

    const dialogRef = this.dialog.open(SendPushModalComponent, {
      width: '600px',
      data: {
        clients: selected,
        totalSelected: selected.length
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.selectedClients.set([]);
      }
    });
  }

  getName(c: Client): string {
    if (c['fio']) return c['fio'];
    if (c['last_name'] && c['first_name']) return `${c['last_name']} ${c['first_name']}`;
    if (c['last_name']) return c['last_name'];
    if (c['first_name']) return c['first_name'];
    if (c['phone']) return c['phone'];
    return c['id'] || c['user_id'] || '—';
  }

  getVal(c: Client, field: string): string {
    const v = c[field];
    if (v == null) return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    if (typeof v === 'number') return v.toLocaleString('ru-RU');
    return String(v);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}
