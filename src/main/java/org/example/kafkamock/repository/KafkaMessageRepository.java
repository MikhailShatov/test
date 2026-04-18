package org.example.kafkamock.repository;

import org.example.kafkamock.entity.KafkaMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KafkaMessageRepository extends JpaRepository<KafkaMessageEntity, Long> {
}