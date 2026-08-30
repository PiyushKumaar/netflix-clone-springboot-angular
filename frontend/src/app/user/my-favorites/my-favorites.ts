import { Component, HostListener, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { VideoService } from '../../services/video-service';
import { WatchlistService } from '../../services/watchlist-service';
import { NotificationService } from '../../services/notification-service';
import { UtilityService } from '../../services/utility-service';
import { MediaService } from '../../services/media-service';
import { DialogService } from '../../services/dialog-service';
import { ErrorHandlerService } from '../../services/error-handler-service';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from "@angular/material/tooltip";
import { AdminRoutingModule } from "../../admin/admin-routing-module";

@Component({
  selector: 'app-my-favorites',
  imports: [MatIcon, MatProgressSpinner, MatFormField, MatPrefix, MatInput, MatButtonModule, MatSuffix, MatProgressBar, MatTooltip, AdminRoutingModule],
  templateUrl: './my-favorites.html',
  styleUrl: './my-favorites.css',
})
export class MyFavorites {

  allVideos = signal<any[]>([]);
  filteredVideos = signal<any[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal(false);
  searchQuery = signal<string>('');

  currentPage = signal(0);
  pageSize = signal(10);
  totalElemets = signal(0);
  totalPages = signal(0);
  hasMoreVideos = signal(true);

  private searchSubject = new Subject<string>();

  constructor(
    private videoService: VideoService,
    private watchlistService: WatchlistService,
    private notification: NotificationService,
    public utilityService: UtilityService,
    public mediaService: MediaService,
    private dialogService: DialogService,
    private errorHandlerService: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.loadVideos();
    this.initializeSearchDebounce();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  initializeSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.performSearch();
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore() && !this.loading() && this.hasMoreVideos()) {
      this.loadMoreVideos();
    }
  }

  loadVideos(page: number = 0) {
    this.error.set(false);
    this.currentPage.set(0);
    this.allVideos.set([]);
    this.filteredVideos.set([]);
    const search = this.searchQuery().trim() || undefined;
    this.loading.set(true);

    this.watchlistService.getWatchlist(page, this.pageSize(), search).subscribe({
      next: (response: any) => {
        this.allVideos.set(response.content);
        this.filteredVideos.set(response.content);
        this.currentPage.set(response.number);
        this.totalElemets.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.hasMoreVideos.set(this.currentPage() < this.totalPages() - 1);
        this.loading.set(false);


      },
      error: (err) => {
        console.error('Error loading videos:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    })
  }

  loadMoreVideos() {
    if (this.loadingMore() || !this.hasMoreVideos()) return;

    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    const search = this.searchQuery().trim() || undefined;

    this.watchlistService.getWatchlist(nextPage, this.pageSize(), search).subscribe({
      next: (response: any) => {
        this.allVideos.set([...this.allVideos(), ...response.content]);
        this.filteredVideos.set([...this.filteredVideos(), ...response.content]);
        this.currentPage.set(response.number);
        this.hasMoreVideos.set(this.currentPage() < this.totalPages() - 1);
        this.loadingMore.set(false);
      },
      error: (err) => {
        this.notification.error('Failed to load more videos');
        this.loadingMore.set(false);
      }
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.searchSubject.next(this.searchQuery());
  }

  private performSearch() {
    this.currentPage.set(0);
    this.loadVideos();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(0);
    this.loadVideos();
  }

  toggleWatchlist(video: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const videoId = video.id!;
    this.watchlistService.removeFromWatchlist(videoId).subscribe({
      next: () => {
        this.allVideos.set(this.allVideos().filter((v: any) => v.id !== videoId));
        this.filteredVideos.set(this.filteredVideos().filter((v: any) => v.id !== videoId));
        this.notification.success('Remove from My Favourites');
      },
      error: (err) => {
        this.errorHandlerService.handle(err, 'Failed to remove from My Favorite.Please try again');
      }
    });
  }

  getPosterUrl(video: any) {
    return this.mediaService.getMediaUrl(video, 'image', {
      useCache: true
    }) || '';
  }

  playVideo(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  formatDuration(seconds: number | undefined): string {
    return this.utilityService.formatDuration(seconds);
  }
}
