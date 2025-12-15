package com.nergal.hello.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.hello.entities.Tweet;

@Repository
public interface TweetRepository extends JpaRepository<Tweet, Long>{

}