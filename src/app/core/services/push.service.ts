import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PushPayload {
  user_id: string;
  push_message: string;
  date_start?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  sendPush(payload: PushPayload): Observable<any> {
    const url = this.auth.api('message/push');

    const body = {
      user_id: payload.user_id,
      push_message: payload.push_message,
      ...(payload.date_start && { date_start: payload.date_start })
    };

    return this.http.post(url, body);
  }
}
