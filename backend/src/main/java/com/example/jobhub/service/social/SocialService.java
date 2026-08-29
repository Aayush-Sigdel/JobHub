package com.example.jobhub.service.social;

import com.example.jobhub.model.SocialPlatform;

public interface SocialService<T> {

    T fetch(String identifier);

    SocialPlatform getType();
}
