package com.taurimark;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.taurimark.mapper")
public class TauriMarkApplication {
    public static void main(String[] args) {
        SpringApplication.run(TauriMarkApplication.class, args);
    }
}
