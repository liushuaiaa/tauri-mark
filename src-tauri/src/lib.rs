use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Memo {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub deleted_at: Option<i64>,
    pub encrypted: bool,
    pub password_hint: Option<String>,
    pub weather_icon: Option<String>,
    pub weather_temp: Option<i32>,
}

fn get_app_dir(app_handle: &tauri::AppHandle) -> PathBuf {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data dir");
    fs::create_dir_all(&app_dir).ok();
    app_dir
}

fn get_memo_file_path(app_handle: &tauri::AppHandle) -> PathBuf {
    get_app_dir(app_handle).join("memos.json")
}

// ============ Memo Commands ============

#[tauri::command]
fn get_memos(app_handle: tauri::AppHandle) -> Vec<Memo> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return vec![];
    }
    let data = fs::read_to_string(&path).unwrap_or_default();
    serde_json::from_str(&data).unwrap_or_default()
}

#[tauri::command]
fn save_memo(app_handle: tauri::AppHandle, memo: Memo) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    let mut memos: Vec<Memo> = if path.exists() {
        let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        vec![]
    };

    if let Some(pos) = memos.iter().position(|m| m.id == memo.id) {
        memos[pos] = memo;
    } else {
        memos.push(memo);
    }

    let json = serde_json::to_string_pretty(&memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

// Soft delete - set deleted_at timestamp
#[tauri::command]
fn trash_memo(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return Ok(());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut memos: Vec<Memo> = serde_json::from_str(&data).unwrap_or_default();

    if let Some(memo) = memos.iter_mut().find(|m| m.id == id) {
        memo.deleted_at = Some(chrono_timestamp());
    }

    let json = serde_json::to_string_pretty(&memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

// Restore from trash - clear deleted_at
#[tauri::command]
fn restore_memo(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return Ok(());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut memos: Vec<Memo> = serde_json::from_str(&data).unwrap_or_default();

    if let Some(memo) = memos.iter_mut().find(|m| m.id == id) {
        memo.deleted_at = None;
    }

    let json = serde_json::to_string_pretty(&memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

// Permanent delete
#[tauri::command]
fn permanent_delete_memo(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return Ok(());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut memos: Vec<Memo> = serde_json::from_str(&data).unwrap_or_default();
    memos.retain(|m| m.id != id);
    let json = serde_json::to_string_pretty(&memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

// Get trashed memos
#[tauri::command]
fn get_trashed_memos(app_handle: tauri::AppHandle) -> Vec<Memo> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return vec![];
    }
    let data = fs::read_to_string(&path).unwrap_or_default();
    let memos: Vec<Memo> = serde_json::from_str(&data).unwrap_or_default();
    memos.into_iter().filter(|m| m.deleted_at.is_some()).collect()
}

// Empty trash - delete all trashed memos
#[tauri::command]
fn empty_trash(app_handle: tauri::AppHandle) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return Ok(());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let memos: Vec<Memo> = serde_json::from_str(&data).unwrap_or_default();
    let active_memos: Vec<Memo> = memos.into_iter().filter(|m| m.deleted_at.is_none()).collect();
    let json = serde_json::to_string_pretty(&active_memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

// Cleanup trash - delete memos trashed before X days
#[tauri::command]
fn cleanup_trash(app_handle: tauri::AppHandle, days: i64) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return Ok(());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let memos: Vec<Memo> = serde_json::from_str(&data).unwrap_or_default();
    let cutoff = chrono_timestamp() - days * 24 * 60 * 60 * 1000;
    let active_memos: Vec<Memo> = memos.into_iter()
        .filter(|m| m.deleted_at.is_none() || m.deleted_at.unwrap() > cutoff)
        .collect();
    let json = serde_json::to_string_pretty(&active_memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

// Legacy delete_memo - now calls trash_memo for backward compatibility
#[tauri::command]
fn delete_memo(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    trash_memo(app_handle, id)
}

// ============ File Commands ============

#[tauri::command]
fn read_file_as_base64(path: String) -> Result<String, String> {
    let data = fs::read(&path).map_err(|e| e.to_string())?;
    use base64::Engine;
    Ok(base64::engine::general_purpose::STANDARD.encode(&data))
}

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

// ============ Utility ============

fn chrono_timestamp() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64
}

// ============ App Entry ============

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_memos,
            save_memo,
            trash_memo,
            restore_memo,
            permanent_delete_memo,
            get_trashed_memos,
            empty_trash,
            cleanup_trash,
            delete_memo,
            read_file_as_base64,
            read_text_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
