package com.nergal.docseq.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Tweet;

@Repository
public interface TweetRepository extends JpaRepository<Tweet, Long>{

}