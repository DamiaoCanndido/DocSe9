package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nergal.docseq.controllers.dto.CreateTweetDTO;
import com.nergal.docseq.controllers.dto.FeedDTO;
import com.nergal.docseq.controllers.dto.FeedItemDTO;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.Tweet;
import com.nergal.docseq.repositories.TweetRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class TweetService {

    private final TweetRepository tweetRepository;
    private final UserRepository userRepository;

    public TweetService(TweetRepository tweetRepository, UserRepository userRepository) {
        this.tweetRepository = tweetRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public FeedDTO getFeed(int page, int pageSize) {
        var tweets = tweetRepository.findAll(
            PageRequest.of(page, pageSize, Sort.Direction.DESC, "createdAt"))
            .map(tweet -> new FeedItemDTO(
                tweet.getTweetId(),
                tweet.getContent(),
                tweet.getUser().getUsername()
            ));

        return new FeedDTO(
            tweets.getContent(), 
            page, 
            pageSize, 
            tweets.getTotalPages(), 
            tweets.getTotalElements()
        );
    }

    @Transactional
    public void createTweet(CreateTweetDTO dto, JwtAuthenticationToken token){
        var user = userRepository.findById(UUID.fromString(token.getName()));
        var tweet = new Tweet();
        tweet.setUser(user.get());
        tweet.setContent(dto.content());
        tweetRepository.save(tweet);
    }

    @Transactional
    public void deleteTweet(Long tweetId, JwtAuthenticationToken token){
        var user = userRepository.findById(UUID.fromString(token.getName()));

        var isAdmin = user.get().getRoles()
            .stream()
            .anyMatch(role -> role.getName().equalsIgnoreCase(Role.Values.admin.name()));

        var tweet = tweetRepository.findById(tweetId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (isAdmin || tweet.getUser().getUserId().equals(UUID.fromString(token.getName()))) {
            tweetRepository.deleteById(tweetId);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }
}
