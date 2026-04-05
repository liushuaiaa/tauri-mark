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

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Memo>>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate) {
        Long userId = getCurrentUserId();
        List<Memo> memos = memoService.getMemos(userId, keyword, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(memos));
    }

    @GetMapping("/page")
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
        result.put("page", page);
        result.put("pageSize", pageSize);
        result.put("total", total);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/query/{id}")
    public ResponseEntity<ApiResponse<Memo>> getMemo(@PathVariable String id) {
        Memo memo = memoService.getMemo(id, getCurrentUserId());
        if (memo == null) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "记事本不存在"));
        }
        return ResponseEntity.ok(ApiResponse.success(memo));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Memo>> createMemo(@RequestBody Memo memo) {
        memoService.saveMemo(memo, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(memo));
    }

    @PostMapping("/edit")
    public ResponseEntity<ApiResponse<Memo>> updateMemo(@RequestBody Memo memo) {
        if (memo.getId() == null || memo.getId().isEmpty()) {
            return ResponseEntity.status(400).body(ApiResponse.error(400, "ID不能为空"));
        }
        memoService.saveMemo(memo, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(memo));
    }

    @PostMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMemo(@PathVariable String id) {
        memoService.trashMemo(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/delete/{id}/permanent")
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

    @PostMapping("/trash/empty")
    public ResponseEntity<ApiResponse<Void>> emptyTrash() {
        memoService.emptyTrash(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/trash/cleanup")
    public ResponseEntity<ApiResponse<Void>> cleanupTrash(@RequestParam int days) {
        memoService.cleanupTrash(getCurrentUserId(), days);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
