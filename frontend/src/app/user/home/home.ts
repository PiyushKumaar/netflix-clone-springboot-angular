import { Component, HostListener, signal } from '@angular/core';
import { Header } from '../../shared/commonComp/header/header';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { VideoService } from '../../services/video-service';
import { WatchlistService } from '../../services/watchlist-service';
import { NotificationService } from '../../services/notification-service';
import { UtilityService } from '../../services/utility-service';
import { MediaService } from '../../services/media-service';
import { DialogService } from '../../services/dialog-service';
import { ErrorHandlerService } from '../../services/error-handler-service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: 'app-home',
  imports: [MatIcon, MatProgressSpinner, MatFormField, MatPrefix, MatInput, MatButtonModule, MatSuffix, MatProgressBar, MatTooltip],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  allVideos = signal<any[]>([]);
  filteredVideos = signal<any[]>([]);
  loading= signal(true);
  loadingMore = signal(false);
  error = signal(false);
  searchQuery = signal<string>('');

  featuredVideos = signal<any[]>([]);
  currentSlideIndex = signal(0);
  featuredLoading = signal(true);

  currentPage = signal(0);
  pageSize = signal(10);
  totalElemets = signal(0);
  totalPages = signal(0);
  hasMoreVideos = signal(true);

  private searchSubject = new Subject<string>();
  private sliderInterval : any;
  private savedScrollPosition : number = 0;

  constructor(
    private videoService : VideoService,
    private watchlistService : WatchlistService,
    private notification : NotificationService,
    public utilityService : UtilityService,
    public mediaService : MediaService,
    private dialogService : DialogService,
    private errorHandlerService : ErrorHandlerService
  ){}

  ngOnInit():void{
    this.loadFeaturedVideos();
    this.loadVideos();
    this.initializeSearchDebounce();
  }

  ngOnDestroy() : void{
    this.searchSubject.complete();
    this.stopSlider();
  }

  initializeSearchDebounce():void{
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(()=>{
      this.performSearch();
    });
  }

  loadFeaturedVideos(){
    this.featuredLoading.set(true);
    this.videoService.getFeaturedVideos().subscribe({
      next:(videos:any) => {
        this.featuredVideos.set(videos);
        this.featuredLoading.set(false);
        if(this.featuredVideos().length > 1){
          this.startSlider();
        }
      },
      error : (err) =>{
        this.featuredLoading.set(false);
        this.errorHandlerService.handle(err,'Error loading feautred videos');
      }
    });
  }

  private startSlider(){
    this.sliderInterval = setInterval(()=>{
      this.nextSlide();
    },5000);
  }

  private stopSlider(){
    if(this.sliderInterval){
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide(){
    if(this.featuredVideos().length > 0){
      this.currentSlideIndex.set((this.currentSlideIndex() + 1) % this.featuredVideos().length);
    }
  }

  prevSlide(){
    if(this.featuredVideos().length > 0){
      this.currentSlideIndex.set((this.currentSlideIndex() -1 + this.featuredVideos().length) % this.featuredVideos().length);
    }
  }

  goToSLide(index : number){
    this.currentSlideIndex.set(index);
    this.stopSlider();
    if(this.featuredVideos().length > 1){
      this.startSlider();
    }
  }

  getCurrentFeatureVideo(){
    return this.featuredVideos()[this.currentSlideIndex()] || null;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore() && !this.loading() && this.hasMoreVideos()) {
      this.loadMoreVideos();
    }
  }

  loadVideos(page : number = 0){
    this.error.set(false);
    this.currentPage.set(0);
    this.allVideos.set([]);
    this.filteredVideos.set([]);
    const search = this.searchQuery().trim() || undefined;
    const isSearching = !!search;
    this.loading.set(true);

    this.videoService.getPublishedVideosPaginated(page,this.pageSize(),search).subscribe({
      next:(response:any)=>{
        this.allVideos.set(response.content);
        this.filteredVideos.set(response.content);
        this.currentPage.set(response.number);
        this.totalElemets.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.hasMoreVideos.set(this.currentPage() < this.totalPages() - 1);
        this.loading.set(false);

        if(isSearching && this.savedScrollPosition > 0){
          setTimeout(()=>{
            window.scrollTo({
              top:this.savedScrollPosition,
              behavior:'auto'
            });
            this.savedScrollPosition = 0;
          },0);
        }
      },
      error:(err)=>{
        console.error('Error loading videos:',err);
        this.error.set(true);
        this.loading.set(false);
        this.savedScrollPosition = 0;
      }
    })
  }

  loadMoreVideos(){
    if(this.loadingMore() || !this.hasMoreVideos())return;

    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    const search = this.searchQuery().trim() || undefined;

    this.videoService.getPublishedVideosPaginated(nextPage, this.pageSize(),search).subscribe({
      next:(response : any)=>{
        this.allVideos.set([...this.allVideos(),...response.content]);
        this.filteredVideos.set([...this.filteredVideos(),...response.content]);
        this.currentPage.set(response.number);
        this.hasMoreVideos.set(this.currentPage() < this.totalPages() - 1);
        this.loadingMore.set(false);
      },
      error : (err)=>{
        this.notification.error('Failed to load more videos');
        this.loadingMore.set(false);
      }
    });
  }

  onSearch(event : Event){
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.searchSubject.next(this.searchQuery());
  }

  private performSearch(){
    this.savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.currentPage.set(0);
    this.loadVideos();
  }

  clearSearch(){
    this.searchQuery.set('');
    this.currentPage.set(0);
    this.savedScrollPosition = 0;
    this.loadVideos();
  }

  isInWatchlist(video : any) : boolean{
    return video.isInWatchlist === true;
  }

  toggleWatchlist(video:any,event?:Event){
    if(event){
      event.stopPropagation();
    }

    const videoId = video.id!;
    const isInList = this.isInWatchlist(video);

    if(isInList){
      video.isInWatchlist = false;
      this.watchlistService.removeFromWatchlist(videoId).subscribe({
        next:()=>{
          this.notification.success('Remove from My Favourites');
        },
        error:(err)=>{
          video.isInWatchlist = true;
          this.errorHandlerService.handle(err,'Failed to remove from My Favorite.Please try again');
        }
      });
    }else{
      video.isInWatchlist = true;
      this.watchlistService.addToWatchList(videoId).subscribe({
        next:()=>{
          this.notification.success('Added to My Favourites');
        },
        error:(err)=>{
          video.isInWatchlist = false;
          this.errorHandlerService.handle(err,'Failed to add to My Favorite.Please try again');
        }
      });
    }
  }

  getPosterUrl(video:any){
    return this.mediaService.getMediaUrl(video,'image',{
      useCache : true
    }) || '';
  }

  playVideo(video:any){
    this.dialogService.openVideoPlayer(video);
  }

  formatDuration(seconds : number | undefined) : string{
    return this.utilityService.formatDuration(seconds);
  }

}
