package com.microservice.event.dto;

import java.util.Set;

public class EventStateChangedDTO {
    private Long eventId;
    private String eventName;
    private String oldState;
    private String newState;
    private Set<Long> artistIds;

    public EventStateChangedDTO() {}
    public EventStateChangedDTO(Long eventId, String eventName, String oldState, String newState, Set<Long> artistIds){
        this.eventId = eventId; this.eventName = eventName; this.oldState = oldState; this.newState = newState; this.artistIds = artistIds;
    }

    // getters / setters
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public String getOldState() { return oldState; }
    public void setOldState(String oldState) { this.oldState = oldState; }
    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }
    public Set<Long> getArtistIds() { return artistIds; }
    public void setArtistIds(Set<Long> artistIds) { this.artistIds = artistIds; }
}
