package com.taurimark.service;

import com.taurimark.entity.Memo;
import com.taurimark.mapper.MemoMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemoService {

    private final MemoMapper memoMapper;

    public MemoService(MemoMapper memoMapper) {
        this.memoMapper = memoMapper;
    }

    public List<Memo> getMemos(Long userId) {
        return memoMapper.findByUserId(userId);
    }

    public Memo getMemo(String id, Long userId) {
        return memoMapper.findByIdAndUserId(id, userId);
    }

    public List<Memo> getTrashedMemos(Long userId) {
        return memoMapper.findTrashedByUserId(userId);
    }

    public void saveMemo(Memo memo, Long userId) {
        if (memo.getId() == null || memo.getId().isEmpty()) {
            // Create new memo
            memo.setId(java.util.UUID.randomUUID().toString());
            memo.setUserId(userId);
            memo.setCreatedAt(System.currentTimeMillis());
            memo.setUpdatedAt(System.currentTimeMillis());
            memoMapper.insert(memo);
        } else {
            // Update existing memo
            memo.setUserId(userId);
            memo.setUpdatedAt(System.currentTimeMillis());
            memoMapper.update(memo);
        }
    }

    public void trashMemo(String id, Long userId) {
        memoMapper.softDelete(id, userId, System.currentTimeMillis());
    }

    public void restoreMemo(String id, Long userId) {
        memoMapper.restore(id, userId);
    }

    public void permanentDeleteMemo(String id, Long userId) {
        memoMapper.permanentDelete(id, userId);
    }

    public void emptyTrash(Long userId) {
        memoMapper.emptyTrash(userId);
    }

    public void cleanupTrash(Long userId, int days) {
        long cutoff = System.currentTimeMillis() - (days * 24L * 60L * 60L * 1000L);
        memoMapper.cleanupTrash(userId, cutoff);
    }
}
