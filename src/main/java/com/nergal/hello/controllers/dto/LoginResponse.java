package com.nergal.hello.controllers.dto;

public record LoginResponse(String accessToken, Long expiresIn) {

}
