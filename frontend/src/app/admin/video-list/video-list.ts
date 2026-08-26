import { ChangeDetectorRef, Component, HostListener, signal } from '@angular/core';
import { DialogService } from '../../services/dialog-service';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from '../../services/notification-service';
import { VideoService } from '../../services/video-service';
import { UtilityService } from '../../services/utility-service';
import { MediaService } from '../../services/media-service';
import { ErrorHandlerService } from '../../services/error-handler-service';
import { MatButtonModule } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-video-list',
  imports: [MatIcon, MatButtonModule, MatTooltip, MatProgressBar , MatSlideToggle,MatProgressSpinner],
  templateUrl: './video-list.html',
  styleUrl: './video-list.css',
})
export class VideoList {

  pagedVideos: any = [];
  loading = false;
  loadingMore = false;
  searchQuery = signal('');

  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  hasMoreVideos = true;

  totalVideos = 0;
  publishedVideos = 0;
  totalDurationSeconds = 0;

  // data = new MatTableDataSource<any>([]);

  constructor(
    private dialogService: DialogService,
    private notification: NotificationService,
    private videoService: VideoService,
    public utilityService: UtilityService,
    public mediaService: MediaService,
    private errorHandlerService: ErrorHandlerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Defer the very first load so it never lands inside the parent's
    // initial change-detection pass (this was a major NG0100 source when
    // the video-service observable happened to resolve synchronously).
    setTimeout(() => {
      this.load();
      this.loadStats();
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && !this.loading && this.hasMoreVideos) {
      this.loadMoreVideos();
    }
  }

  load() {
    this.loading = true;
    this.currentPage = 0;
    this.pagedVideos = [];
    const search = this.searchQuery().trim() || undefined

    this.videoService.getAllAdminVideos(this.currentPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        // Defer state mutation to the next macrotask so it never collides
        // with an in-progress change-detection pass (fixes NG0100).
        setTimeout(() => {
          this.pagedVideos = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
          this.hasMoreVideos = this.currentPage < this.totalPages - 1;
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        setTimeout(() => {
          this.loading = false;
          this.loadingMore = false;
          this.cdr.markForCheck();
          this.errorHandlerService.handle(err, 'Failed to load more videos');
        });
      }
    })
  }

  loadMoreVideos() {

    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery().trim() || undefined;

    this.videoService.getAllAdminVideos(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        setTimeout(() => {
          this.pagedVideos = [...this.pagedVideos, ...response.content];
          this.currentPage = response.number;
          this.hasMoreVideos = this.currentPage < this.totalPages - 1;
          this.loadingMore = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        setTimeout(() => {
          this.loadingMore = false;
          this.cdr.markForCheck();
          this.errorHandlerService.handle(err, 'Failed to load more videos');
        });
      }
    })
  }

  loadStats() {
    this.videoService.getStatsByAdmin().subscribe((stats: any) => {
      setTimeout(() => {
        this.totalVideos = stats.totalVideos;
        this.publishedVideos = stats.publishedVideos;
        this.totalDurationSeconds = stats.totalDuration ?? 0;
        this.cdr.markForCheck();
      });
    })
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage = 0;
    this.load();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage = 0;
    this.load();
  }

  play(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  createNew() {
    const dialogRef = this.dialogService.openVideoFromDialog('create');
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        setTimeout(() => {
          this.load();
          this.loadStats();
        });
      }
    })
  }

  edit(video: any) {
    const dialogRef = this.dialogService.openVideoFromDialog('edit', video);
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        setTimeout(() => {
          this.load();
          this.loadStats();
        });
      }
    })
  }

  remove(video: any) {
    this.dialogService.openConfirmation(
      `Delete Video?`,
      `Are you sure you want to delete "${video.title}"? This action cannot be undone.`,
      `Delete`,
      `Cancel`,
      `danger`
    ).subscribe(response => {
      if (response) {
        setTimeout(() => {
          this.loading = true;
          this.cdr.markForCheck();

          this.videoService.deleteVideoByAdmin(video.id).subscribe({
            next: () => {
              setTimeout(() => {
                this.notification.success('Video deleted successfully');
                this.load();
                this.loadStats();
              });
            },
            error: (err) => {
              setTimeout(() => {
                this.loading = false;
                this.cdr.markForCheck();
                this.errorHandlerService.handle(err, 'Failed to delete video. Please try again ');
              });
            }
          })
        });
      }
    })
  }

  togglePublish(event:MatSlideToggleChange, video: any) {
    const newPublishedState = event.checked;
    this.videoService.setPublishedByAdmin(video.id, newPublishedState).subscribe({
      next: (response) => {
          video.published = newPublishedState;
          this.notification.success(`Video ${video.published ? 'published' : 'unpublished'} successfully`);
          this.loadStats();
          this.cdr.markForCheck();
      },
      error: (err) => {

          video.published = !newPublishedState;
          this.cdr.markForCheck();
      }
    });
  }

  getPublishedCount(): number {
    return this.publishedVideos;
  }

  getTotalDuration(): string {
    const total = this.totalDurationSeconds;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`
  }

  formatDuration(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
  }

  getPosterUrl(video: any): string | null {
    // Returns null when the video has no poster uploaded yet (poster is
    // null in the API response). The template falls back to a CSS
    // placeholder in that case instead of rendering a broken <img>.
    return this.mediaService.getMediaUrl(video.poster, 'image', {
      useCache: true
    });
  }
}