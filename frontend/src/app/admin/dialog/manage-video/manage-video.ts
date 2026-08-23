import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { RATINGS, VIDEO_CATEGORIES } from '../../../shared/constants/app.constants';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { VideoService } from '../../../services/video-service';
import { NotificationService } from '../../../services/notification-service';
import { MediaService } from '../../../services/media-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorHandlerService } from '../../../services/error-handler-service';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButtonModule } from "@angular/material/button";
import { MatError, MatFormField, MatHint, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from "@angular/material/input";
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-manage-video',
  imports: [ReactiveFormsModule, MatIcon, MatProgressBar, MatButtonModule, MatFormField, MatLabel, MatInput, MatError, MatPrefix, MatOption, MatHint, MatSelect, MatSlideToggle],
  templateUrl: './manage-video.html',
  styleUrl: './manage-video.css',
})
export class ManageVideo {
  isSaving = false;

  isUploadingVideo = false;
  isUploadingPoster = false;
  uploadProgress = 0;
  posterProgress = 0;

  categoriesAll = VIDEO_CATEGORIES;
  ratings = RATINGS;
  videoForm: any;

  videoPreviewUrl: string | null = null;
  posterPreviewUrl: string | null = null;
  isEditMode = false;

  get hasVideo(): boolean {
    return !!this.videoForm.get('src')?.value;
  }

  get hasPoster(): boolean {
    return !!this.videoForm.get('poster')?.value;
  }

  constructor(
    private fb: FormBuilder,
    private errorHandleService: ErrorHandlerService,
    private videoService: VideoService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
    private mediaService: MediaService,
    public dialogRef: MatDialogRef<ManageVideo>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = data.mode === 'edit';

    this.videoForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      year: [new Date().getFullYear(), Validators.required],
      rating: ['', [Validators.required]],
      categories: [[] as string[], [Validators.required, ManageVideo.arrayNotEmpty]],
      duration: [0],
      src: ['', [Validators.required]],
      poster: ['', [Validators.required]],
      published: [false]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      const video = this.data.video;

      this.videoForm.patchValue({
        title: video.title,
        description: video.description,
        year: video.year,
        rating: video.rating,
        categories: video.categories || [],
        duration: video.duration,
        src: this.extractUuidFromUrl(video.src),
        poster: this.extractUuidFromUrl(video.poster),
      });

      const srcUuid = this.videoForm.get('src')?.value;
      const posterUuid = this.videoForm.get('poster')?.value;

      if (srcUuid) {
        this.videoPreviewUrl = this.mediaService.getMediaUrl(srcUuid, 'video');
      }
      if (posterUuid) {
        this.posterPreviewUrl = this.mediaService.getMediaUrl(posterUuid, 'image');
      }
    }
  }

  static arrayNotEmpty(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { required: true };
    }
    return null;
  }

  private extractUuidFromUrl(value: string | undefined | null): string {
    if (!value) return '';

    if (!value.includes('/')) {
      return value;
    }

    const segments = value.split('/');
    return segments[segments.length - 1] || '';
  }

  onVideoPicked(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const validVideoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.mpeg', '.ogg'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validVideoExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = file.type.startsWith('video/') || file.type === 'application/octet-stream';

    if (!hasValidMimeType && !hasValidExtension) {
      this.notification.error('Please select a valid video file (MP4, MKV, etc.)');
      return;
    }

    const localBlobUrl = URL.createObjectURL(file);
    this.videoPreviewUrl = localBlobUrl;
    this.extractDurationFromFile(file);

    this.uploadProgress = 0;
    this.isUploadingVideo = true;

    this.mediaService.uploadFile(file).subscribe({
      next: ({ progress, uuid }) => {
        this.uploadProgress = Math.max(0, Math.min(100, progress));

        if (uuid) {
          // Defer the form mutation to the next macrotask so it lands in a
          // fresh change-detection cycle instead of the one currently
          // running (this is what was causing NG0100 / ExpressionChanged).
          setTimeout(() => {
            this.videoForm.patchValue({ src: uuid });
            this.isUploadingVideo = false;
            this.notification.success('Video uploaded successfully');
            this.cdr.markForCheck();
          });
        }
      },
      error: () => {
        this.notification.error('Failed to upload video. Please try again.');
        this.uploadProgress = 0;
        this.isUploadingVideo = false;

        if (this.videoPreviewUrl === localBlobUrl) {
          URL.revokeObjectURL(localBlobUrl);
          this.videoPreviewUrl = null;
        }
      }
    });
  }

  onPosterPicked(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.notification.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.posterPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.posterProgress = 0;
    this.isUploadingPoster = true;

    this.mediaService.uploadFile(file).subscribe({
      next: ({ progress, uuid }) => {
        this.posterProgress = Math.max(0, Math.min(100, progress));

        if (uuid) {
          setTimeout(() => {
            this.videoForm.patchValue({ poster: uuid });
            this.isUploadingPoster = false;
            this.notification.success('Poster uploaded successfully');
            this.cdr.markForCheck();
          });
        }
      },
      error: () => {
        this.notification.error('Failed to upload poster. Please try again.');
        this.posterProgress = 0;
        this.isUploadingPoster = false;
        this.posterPreviewUrl = null;
      }
    });
  }

  private extractDurationFromFile(file: File) {
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    const blobUrl = URL.createObjectURL(file);
    videoElement.src = blobUrl;

    videoElement.onloadedmetadata = () => {
      const duration = isFinite(videoElement.duration) ? Math.round(videoElement.duration) : 0;
      setTimeout(() => {
        this.videoForm.patchValue({ duration });
        this.cdr.markForCheck();
      });
      URL.revokeObjectURL(blobUrl);
    };

    videoElement.onerror = () => {
      URL.revokeObjectURL(blobUrl);
    };
  }

  onSave() {
    this.isSaving = true;
    const formData = this.videoForm.value as Partial<any>;

    const op$ = this.isEditMode
      ? this.videoService.updateVideoByAdmin(this.data.video.id, formData)
      : this.videoService.createVideoByAdmin(formData);

    op$.subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.notification.success(response?.message || 'Video saved successfully.');
        this.dialogRef.close(response);
      },
      error: (err: any) => {
        this.isSaving = false;
        this.errorHandleService.handle(err, 'Failed to save video. Please try again');
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  removeVideo() {
    if (this.videoPreviewUrl && this.videoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreviewUrl);
    }
    this.videoPreviewUrl = null;
    this.videoForm.patchValue({ src: '', duration: 0 });
    this.uploadProgress = 0;
  }

  removePoster() {
    if (this.posterPreviewUrl && this.posterPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.posterPreviewUrl);
    }
    this.posterPreviewUrl = null;
    this.videoForm.patchValue({ poster: '' });
    this.posterProgress = 0;
  }
}