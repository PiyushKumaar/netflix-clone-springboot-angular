import { Component, ElementRef, Inject, Signal, signal, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service';
import { MediaService } from '../../../services/media-service';
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-video-player',
  imports: [MatButtonModule,MatIcon,MatProgressSpinner],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer {
  @ViewChild('videoPlayer',{static:false}) videoElement! : ElementRef<HTMLVideoElement>;

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);
  isMuted = signal(false);
  isFullscreen = signal(false);
  showControls = signal(true);
  controlsTimeout : any;
  private boundFullscreenHandler :any;
  private boundKeydownHandler : any;
  authenticatedVideoUrl = signal<string|null>(null);

  //1. consutructor

  constructor(
    public dialogRef : MatDialogRef<VideoPlayer>,
    @Inject(MAT_DIALOG_DATA) public video:any,
    public utilityService : UtilityService,
    private mediaService : MediaService
  ){
    this.boundFullscreenHandler = this.onFullscreenChange.bind(this);
    this.boundKeydownHandler = this.onKeyDown.bind(this);

    this.loadAuthenticatedVideo();
  }

  //2. Lifecycle hooks

  ngOnInit() : void{
    this.startControlsTimer();

    document.addEventListener('fullscreenchange',this.boundFullscreenHandler);
    document.addEventListener('keydown',this.boundKeydownHandler);

    this.dialogRef.beforeClosed().subscribe(()=>{
      this.cleanup();
    })
  }

  ngOnDestroy() : void{
    this.cleanup();
  }

  //3. Initialization and cleanup

  private loadAuthenticatedVideo() : void{
    this.authenticatedVideoUrl.set(this.mediaService.getMediaUrl(this.video.src,'video'));
  }

  private cleanup(){
    if(this.controlsTimeout){
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }

    document.removeEventListener('fullscreenchange',this.boundFullscreenHandler);
    document.removeEventListener('keydown',this.boundKeydownHandler);

    if(this.videoElement?.nativeElement){
      const video = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
      video.src = '';
      video.load();
      this.isPlaying.set(false);
    }

    if(document.fullscreenElement){
      document.exitFullscreen().catch(()=>{});
    }

  }

  // 4. event handler

  onKeyDown(event : KeyboardEvent){
    if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement){
      return;
    }

    switch(event.key.toLowerCase()){
      case " " : 
      case 'k' :
        event.preventDefault();
        this.togglePlay();
        break;
      case 'arrowleft':
        event.preventDefault();
        this.seekBackward();
        break;
      case 'arrowright':
        event.preventDefault();
        this.seekBackward();
        break;
      case 'arrowup':
        event.preventDefault();
        this.increaseVolume();
        break;
      case 'arrowdown':
        event.preventDefault();
        this.decreaseVolume();
        break;
      case 'm':
        event.preventDefault();
        this.toggleMute();
        break;
      case 'f':
        event.preventDefault();
        this.toggleFullscreen();
        break;
      case 'escape':
        if(document.fullscreenElement){
          event.preventDefault();
          document.exitFullscreen();
        }else{
          this.closePlayer();
        }
        break;
      }
  }

  onFullscreenChange(){
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  onLoadedMetadata(){
    if(this.videoElement?.nativeElement){
      this.duration.set(this.videoElement.nativeElement.duration);
    }
  }

  onTimeUpdate(){
    if(this.videoElement?.nativeElement){
      this.currentTime.set(this.videoElement.nativeElement.currentTime);
    }
  }

  onMouseMove(){
    this.showControls.set(true);
    this.startControlsTimer();
  }

  onVideoCLick(){
    this.togglePlay();
  }

  onProgressClick(event: MouseEvent){
    if(!this.videoElement?.nativeElement || !this.duration()) return;
    const progresBar = event.currentTarget as HTMLElement;
    const rect = progresBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const newTime = pos * this.duration();

    this.videoElement.nativeElement.currentTime = newTime;
    this.currentTime.set(newTime);
  }

  // 5.Video playback controls

  togglePlay(){
    if(!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    this.pauseAllOtherVideos(video);

    if(video.paused){
      video.play().then(() => {
        this.isPlaying.set(true);
      }).catch(err=>{
        console.error("Play error:",err);
        this.isPlaying.set(false);
      });
    }else{
      video.pause();
      this.isPlaying.set(false);
    }

  }

  private pauseAllOtherVideos(currentVideo : HTMLVideoElement){
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video:HTMLVideoElement)=>{
      if(video !== currentVideo && !video.paused){
        video.pause();
      }
    })
  }

  seekForward(){

    if(!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.currentTime = Math.min(video.duration,video.currentTime + 10);
  }

  seekBackward(){

    if(!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.currentTime = Math.max(0,video.currentTime - 10);
  }

  //6. volume controls

  toggleMute(){
    if(!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
    this.isMuted.set(video.muted);
  }

  changeVolume(event:Event){
    if(!this.videoElement?.nativeElement) return;

    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    this.setVolume(value);
    this.isMuted.set(this.volume() === 0);
  }

  increaseVolume(){
    if(!this.videoElement?.nativeElement) return;

    const newVolume = Math.min(1,this.volume() + 0.1);
    this.setVolume(newVolume);
    this.isMuted.set(false);
    this.videoElement.nativeElement.muted=false;
  }

  decreaseVolume(){
    if(!this.videoElement?.nativeElement) return;

    const newVolume = Math.max(0,this.volume()-0.1);
    this.setVolume(newVolume);
    this.isMuted.set(newVolume === 0);
  }

  private setVolume(value : number){
    if(!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.volume = value;
    this.volume.set(value);
  }

  // 7. Fullscreen controls

  toggleFullscreen(){

    const container = document.querySelector('.player-container');
    if(!document.fullscreenElement){
      container?.requestFullscreen();
      this.isFullscreen.set(true);
    }
    else{
      document.exitFullscreen();
      this.isFullscreen.set(false);
    }
  }

  // 8. UI Controls 

  startControlsTimer(){
    if(this.controlsTimeout){
      clearTimeout(this.controlsTimeout); 
    }
    this.controlsTimeout = setTimeout(()=>{
      if(this.isPlaying()){
        this.showControls.set(false);
      }
    },3000);
  }

  closePlayer(){
    this.dialogRef.close();
  }

  // 9. Utility methods
  
  formatTime(seconds:number):string{
    return this.utilityService.formatDuration(seconds);
  }

  //10. Getters

  get videoSrc() : string | null {
    return this.authenticatedVideoUrl();
  }

  get progressPercent() : number{
    return this.duration ? (this.currentTime() / this.duration()) * 100 : 0;
  }

  get volumePercent() : number{
    return this.volume() * 100;
  }
}
