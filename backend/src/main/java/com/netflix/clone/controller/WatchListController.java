package com.netflix.clone.controller;

import com.netflix.clone.dto.response.MessageResponse;
import com.netflix.clone.dto.response.PageResponse;
import com.netflix.clone.dto.response.VideoResponse;
import com.netflix.clone.service.WatchListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/watchList")
public class WatchListController {

    @Autowired
    public WatchListService watchListService;

    @PostMapping("/{videoId}")
    public ResponseEntity<MessageResponse> addToWatchList(@PathVariable Long videoId , Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(watchListService.addToWatchList(email,videoId));
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<MessageResponse> removeFromWatchList(@PathVariable long videoId,Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(watchListService.removeFromWatchList(email,videoId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<VideoResponse>> getWatchList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication){
        String email = authentication.getName();

        PageResponse<VideoResponse> response = watchListService.getWatchListPaginated(email,page,size,search);
        return ResponseEntity.ok(response);
    }

}
