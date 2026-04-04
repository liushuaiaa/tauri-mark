package com.taurimark.entity;

public class Memo {
    private String id;
    private Long userId;
    private String title;
    private String content;
    private Long createdAt;
    private Long updatedAt;
    private Long deletedAt;
    private Boolean encrypted;
    private String passwordHint;
    private String weatherIcon;
    private Integer weatherTemp;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
    public Long getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Long deletedAt) { this.deletedAt = deletedAt; }
    public Boolean getEncrypted() { return encrypted; }
    public void setEncrypted(Boolean encrypted) { this.encrypted = encrypted; }
    public String getPasswordHint() { return passwordHint; }
    public void setPasswordHint(String passwordHint) { this.passwordHint = passwordHint; }
    public String getWeatherIcon() { return weatherIcon; }
    public void setWeatherIcon(String weatherIcon) { this.weatherIcon = weatherIcon; }
    public Integer getWeatherTemp() { return weatherTemp; }
    public void setWeatherTemp(Integer weatherTemp) { this.weatherTemp = weatherTemp; }
}
