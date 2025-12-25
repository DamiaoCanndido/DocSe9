package com.nergal.docseq.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Notice;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, UUID> { }

