package com.nergal.docseq.repositories;

import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Notice;

@Repository
public interface NoticeRepository extends DocumentRepository<Notice> { }

