# 视频帧提取功能说明

## 功能概述

本次更新将视频帧提取功能从渲染进程移至主进程，使用 fluent-ffmpeg 库进行高质量的视频帧提取。

## 主要改进

1. **高质量提取**: 使用 FFmpeg 确保一帧不落的提取视频的每一帧
2. **任务管理**: 支持取消正在进行的视频处理任务
3. **进度反馈**: 实时显示提取进度和状态
4. **内存优化**: 自动清理临时文件和资源
5. **多视频切换**: 安全处理多次切换视频文件的情况

## 实现细节

### 主进程 (Main Process)

1. **video-processor.js**: 核心视频处理类
   - 使用 fluent-ffmpeg 提取视频帧
   - 支持任务取消和状态管理
   - 自动清理临时文件

2. **router.list.js**: 添加了以下新路由
   - `extract-video-frames`: 提取视频帧
   - `save-temp-video`: 保存临时视频文件
   - `cancel-video-extraction`: 取消视频处理
   - `cleanup-temp-video`: 清理临时文件
   - `get-video-extraction-status`: 获取处理状态

### 渲染进程 (Renderer Process)

1. **ControlPanle.vue**: 更新了视频处理逻辑
   - `setVideo()`: 处理视频文件选择
   - `extractVideoFramesWithFFmpeg()`: 调用主进程进行视频处理
   - `cancelVideoExtraction()`: 取消当前任务
   - `handleVideoExtractionProgress()`: 处理进度反馈

## 使用方法

1. 点击"Import"按钮选择视频文件
2. 系统会自动使用 FFmpeg 提取所有视频帧
3. 提取过程中会显示进度信息
4. 完成后可以使用"Previous"/"Next"按钮浏览帧

## 注意事项

1. **FFmpeg 依赖**: 确保系统安装了 FFmpeg，或在生产环境中打包 FFmpeg 二进制文件
2. **内存使用**: 长视频可能占用大量内存，建议对视频长度进行限制
3. **文件格式**: 支持所有 FFmpeg 支持的视频格式
4. **错误处理**: 包含完整的错误处理和用户反馈

## 技术栈

- **FFmpeg**: 视频处理引擎
- **fluent-ffmpeg**: Node.js FFmpeg 包装器
- **Electron IPC**: 主进程与渲染进程通信
- **Vue.js**: 前端界面框架
- **Element Plus**: UI 组件库
