# 图片存储优化方案

## 当前问题

目前备忘录中的图片以 Base64 格式直接嵌入到 `memos.json` 中，这种方式存在以下问题：

| 问题 | 影响 |
|------|------|
| 体积增大约 33% | Base64 编码每 3 字节转 4 字符，文件明显膨胀 |
| 无法增量更新 | 每次保存都需重写整个 JSON 文件 |
| 内存占用高 | 读取时整个文件加载，base64 字符串占用双倍空间 |
| 迁移困难 | 单个大文件不便于备份和数据迁移 |

## 优化方案

### 核心思路

将图片文件单独存储在 `app_data_dir/images/` 目录中，备忘录仅保存图片的相对路径引用。

### 目录结构

```
{APP_DATA_DIR}/
├── memos.json          # 备忘录数据（仅含文本和路径引用）
└── images/
    ├── {uuid1}.png
    ├── {uuid2}.jpg
    └── {uuid3}.webp
```

### 数据模型变更

```typescript
// 现状
interface Memo {
  id: string
  title: string
  content: string   // HTML 内容，图片以 base64 形式嵌入
  created_at: number
  updated_at: number
}

// 优化后
interface Memo {
  id: string
  title: string
  content: string   // HTML 内容，图片以相对路径引用，如 ./images/{uuid}.png
  created_at: number
  updated_at: number
}
```

### Tauri 命令变更

新增命令：

```rust
// 保存图片到本地目录，返回相对路径
#[tauri::command]
fn save_image(app_handle: tauri::AppHandle, base64_data: String, extension: String) -> Result<String, String>

// 读取图片并返回 base64（前端渲染时需要）
#[tauri::command]
fn get_image_base64(app_handle: tauri::AppHandle, relative_path: String) -> Result<String, String>

// 删除图片文件（当关联的备忘录被删除时）
#[tauri::command]
fn delete_image(app_handle: tauri::AppHandle, relative_path: String) -> Result<(), String>
```

修改命令：

```rust
// delete_memo 需同时删除关联的图片
#[tauri::command]
fn delete_memo(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    // 1. 获取备忘录内容，提取所有图片路径
    // 2. 删除关联的图片文件
    // 3. 从 memos.json 中移除备忘录
}
```

### 前端变更

1. **编辑器插入图片时**
   - 将图片转为 base64
   - 调用 `save_image` 上传到本地
   - 将返回的相对路径插入 HTML 内容

2. **渲染备忘录内容时**
   - 富文本组件需支持相对路径的图片加载
   - 或在渲染前将相对路径转为 `app_data_dir` 的绝对路径

### 迁移方案

发布优化版本时，需要一个一次性迁移脚本：

```rust
// 遍历 memos.json 中所有备忘录
// 提取 content 中的 base64 图片
// 保存到 images/ 目录
// 替换 content 中的 base64 为相对路径
```

### 优势对比

| 维度 | Base64（现状） | 本地文件（优化后） |
|------|---------------|------------------|
| 存储体积 | 大（+33%） | 小（原始大小） |
| 读取性能 | 差（全文件加载） | 好（按需加载） |
| 写入性能 | 差（全文件重写） | 好（增量更新） |
| 数据迁移 | 困难 | 简单（文件复制） |
| 图片复用 | 无法复用（重复存储） | 可复用（同一图片多引用） |

## 实现优先级

建议在以下情况时考虑实施：

1. 备忘录中经常插入多张图片
2. 用户反馈存储文件过大或读取慢
3. 需要支持图片拖拽导入功能

## 注意事项

- 图片目录需定期清理孤立文件（无备忘录引用的图片）
- 考虑添加图片大小限制（如单张 10MB）
- 考虑添加图片格式限制（如仅支持 png/jpg/webp）
