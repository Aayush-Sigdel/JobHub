package com.example.jobhub.service.social;

public interface SocialService<T> {

    T fetch(String identifier);

    SocialType getType();
}
