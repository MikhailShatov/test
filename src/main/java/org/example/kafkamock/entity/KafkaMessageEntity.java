package org.example.kafkamock.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kafka_messages")
public class KafkaMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "msg_id", nullable = false, length = 36)
    private String msgId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "inn", nullable = false, length = 12)
    private String inn;

    @Column(name = "time_rq", nullable = false)
    private LocalDateTime timeRq;

    public Long getId() {
        return id;
    }

    public String getMsgId() {
        return msgId;
    }

    public void setMsgId(String msgId) {
        this.msgId = msgId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getInn() {
        return inn;
    }

    public void setInn(String inn) {
        this.inn = inn;
    }

    public LocalDateTime getTimeRq() {
        return timeRq;
    }

    public void setTimeRq(LocalDateTime timeRq) {
        this.timeRq = timeRq;
    }
}