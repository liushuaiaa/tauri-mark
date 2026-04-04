package com.taurimark.controller;

import com.taurimark.dto.ApiResponse;
import com.taurimark.entity.Memo;
import com.taurimark.service.MemoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/memos")
public class MemoController {

    private final MemoService memoService;

    public MemoController(MemoService memoService) {
        this.memoService = memoService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMemos(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = getCurrentUserId();
        List<Memo> memos = memoService.getMemos(userId, keyword, startDate, endDate, page, pageSize);
        int total = memoService.countMemos(userId, keyword, startDate, endDate);
        Map<String, Object> result = new HashMap<>();
        result.put("list", memos);
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", pageSize);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Memo>> getMemo(@PathVariable String id) {
        Memo memo = memoService.getMemo(id, getCurrentUserId());
        if (memo == null) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "记事本不存在"));
        }
        return ResponseEntity.ok(ApiResponse.success(memo));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Memo>> createMemo(@RequestBody Memo memo) {
        memoService.saveMemo(memo, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(memo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Memo>> updateMemo(@PathVariable String id, @RequestBody Memo memo) {
        memo.setId(id);
        memoService.saveMemo(memo, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(memo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMemo(@PathVariable String id) {
        memoService.trashMemo(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentDeleteMemo(@PathVariable String id) {
        memoService.permanentDeleteMemo(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    // Trash endpoints
    @GetMapping("/trash")
    public ResponseEntity<ApiResponse<List<Memo>>> getTrash() {
        List<Memo> memos = memoService.getTrashedMemos(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(memos));
    }

    @PostMapping("/trash/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreMemo(@PathVariable String id) {
        memoService.restoreMemo(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/trash/empty")
    public ResponseEntity<ApiResponse<Void>> emptyTrash() {
        memoService.emptyTrash(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/trash/cleanup")
    public ResponseEntity<ApiResponse<Void>> cleanupTrash(@RequestParam int days) {
        memoService.cleanupTrash(getCurrentUserId(), days);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
