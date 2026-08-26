import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth-service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private apiUrl = environment.apiUrl + '/files';
  private imageCache = new Map<string, string>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  uploadFile(file: File): Observable<{ progress: number; uuid?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const isVideo = file.type.startsWith('video/');
    const uploadUrl = isVideo
      ? `${this.apiUrl}/upload/video`
      : `${this.apiUrl}/upload/image`;

    const req = new HttpRequest('POST', uploadUrl, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (!event.total || event.total <= 0) {
            return { progress: 0 };
          }

          const progress = Math.round((event.loaded / event.total) * 100);

          return {
            progress: Math.max(0, Math.min(100, progress))
          };
        }

        if (event.type === HttpEventType.Response) {
          const body = event.body as any;
          return {
            progress: 100,
            uuid: body?.uuid || ''
          };
        }

        return { progress: 0 };
      })
    );
  }

  getMediaUrl(
    mediaValue: any,
    type: 'image' | 'video',
    options?: { useCache?: boolean }
  ): string | null {
    let value = mediaValue;

    if (type === 'image' && mediaValue && typeof mediaValue === 'object' && mediaValue.poster) {
      value = mediaValue.poster;
    }

    if (!value) {
      return null;
    }

    let uuid = value;
    if (typeof value === 'string' && value.includes(`/${type}/`)) {
      uuid = value.substring(value.lastIndexOf('/') + 1);
    }

    if (options?.useCache && type === 'image' && this.imageCache.has(uuid)) {
      return this.imageCache.get(uuid)!;
    }

    if (typeof uuid === 'string' && (uuid.startsWith('blob:') || uuid.startsWith('data:'))) {
      return uuid;
    }

    const token = this.authService.getToken();
    if (!token) {
      return null;
    }

    const authenticatedUrl = `${this.apiUrl}/${type}/${uuid}?token=${encodeURIComponent(token)}`;

    if (options?.useCache && type === 'image') {
      this.imageCache.set(uuid, authenticatedUrl);
    }

    return authenticatedUrl;
  }
}