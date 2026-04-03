import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { PushService } from '../../../core/services/push.service';
import { Client } from '../../../core/models/client.models';

export interface PushModalData {
  clients: Client[];
  totalSelected: number;
}

@Component({
  selector: 'app-send-push-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './send-push-modal.component.html',
  styleUrls: ['./send-push-modal.component.scss']
})
export class SendPushModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SendPushModalComponent>);
  private readonly pushService = inject(PushService);
  readonly data = inject<PushModalData>(MAT_DIALOG_DATA);

  readonly pushForm = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(5)]],
    sendType: ['instant'],
    sendDate: [null as Date | null]
  });

  get clients(): Client[] {
    return this.data?.clients || [];
  }

  get totalSelected(): number {
    return this.data?.totalSelected || 0;
  }

  getMessageLength(): number {
    const value = this.pushForm.controls.message.value;
    return value ? value.length : 0;
  }

  private extractClientId(client: Client): string | null {
    const id = client['user_id'] || client['id'] || client['userId'] || client['card_id'];
    return id ? String(id) : null;
  }

  onSubmit(): void {
    if (this.pushForm.invalid) {
      this.pushForm.markAllAsTouched();
      return;
    }

    const formValue = this.pushForm.getRawValue();

    const clientIds = this.clients
      .map(c => this.extractClientId(c))
      .filter((id): id is string => id !== null);

    if (clientIds.length === 0) {
      alert('Не удалось определить ID клиентов');
      return;
    }

    const payload = {
      user_id: clientIds.join(','),
      push_message: formValue.message?.trim() || '',
      ...(formValue.sendType === 'scheduled' && formValue.sendDate && {
        date_start: formValue.sendDate.toISOString()
      })
    };


    this.pushService.sendPush(payload).subscribe({
      next: (response: any) => {
        this.dialogRef.close({ success: true });
      },
      error: (err: any) => {
        console.error('❌ PUSH error:', {
          status: err?.status,
          error: err?.error
        });
        alert(`Ошибка: ${err?.error || 'Неизвестная'}`);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
