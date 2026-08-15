package com.netflix.clone.serviceImpl;

import com.netflix.clone.dao.UserRepository;
import com.netflix.clone.dao.VideoRepository;
import com.netflix.clone.dto.response.MessageResponse;
import com.netflix.clone.dto.response.PageResponse;
import com.netflix.clone.dto.response.VideoResponse;
import com.netflix.clone.entity.User;
import com.netflix.clone.entity.Video;
import com.netflix.clone.service.WatchListService;
import com.netflix.clone.util.PaginationUtils;
import com.netflix.clone.util.ServiceUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class WatchListServiceImpl implements WatchListService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ServiceUtils serviceUtils;

    @Override
    public MessageResponse addToWatchList(String email, Long videoId) {

        User user = serviceUtils.getUserByEmailOrThrow(email);
        Video video = serviceUtils.getVideoByIdOrThrow(videoId);

        user.addToWatchList(video);
        userRepository.save(user);

        return new MessageResponse("Video added to watchList Successfully");
    }

    @Override
    public MessageResponse removeFromWatchList(String email, long videoId) {
        User user = serviceUtils.getUserByEmailOrThrow(email);
        Video video = serviceUtils.getVideoByIdOrThrow(videoId);

        user.removeFromWatchList(video);
        userRepository.save(user);

        return new MessageResponse("Video removed from watchList Successfully");
    }

    @Override
    public PageResponse<VideoResponse> getWatchListPaginated(String email, int page, int size, String search) {
        User user = serviceUtils.getUserByEmailOrThrow(email);

        Pageable pageable = PaginationUtils.createPageRequest(page,size);
        Page<Video> videoPage;

        if(search !=null && !search.trim().isEmpty()){
            videoPage = userRepository.searchWatchListByUserId(user.getId(),search.trim(),pageable);
        }else{
            videoPage = userRepository.findWatchListByUserId(user.getId(),pageable);
        }

        return PaginationUtils.toPageResponse(videoPage, VideoResponse::fromEntity);
    }
}
