package org.example.kafkamock.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.kafkamock.entity.KafkaMessageEntity;
import org.example.kafkamock.model.KafkaMessage;
import org.example.kafkamock.repository.KafkaMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);

    private final KafkaMessageRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public KafkaConsumerService(KafkaMessageRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(
            topics = "${app.kafka.topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "3"
    )
    public void consume(String message, Acknowledgment acknowledgment) {
        try {
            log.info("Read from Kafka: {}", message);

            KafkaMessage kafkaMessage = objectMapper.readValue(message, KafkaMessage.class);

            KafkaMessageEntity entity = new KafkaMessageEntity();
            entity.setMsgId(kafkaMessage.getMsgId());
            entity.setFullName(kafkaMessage.getFullName());
            entity.setInn(kafkaMessage.getInn());
            entity.setTimeRq(LocalDateTime.now());

            repository.save(entity);

            acknowledgment.acknowledge();
            log.info("Message saved to DB, msg_id={}", kafkaMessage.getMsgId());

        } catch (Exception e) {
            log.error("Error processing message: {}", message, e);
        }
    }
}