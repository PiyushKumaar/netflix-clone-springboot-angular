package com.netflix.clone.service;

import com.netflix.clone.dto.response.MessageResponse;
import com.netflix.clone.dto.response.PageResponse;
import com.netflix.clone.dto.response.VideoResponse;

public interface WatchListService {
    MessageResponse addToWatchList(String email, Long videoId);

    MessageResponse removeFromWatchList(String email, long videoId);

    PageResponse<VideoResponse> getWatchListPaginated(String email, int page, int size, String search);
}
