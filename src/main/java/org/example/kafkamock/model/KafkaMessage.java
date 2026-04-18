package org.example.kafkamock.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class KafkaMessage {

    @JsonProperty("msg_id")
    private String msgId;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("inn")
    private String inn;

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
}