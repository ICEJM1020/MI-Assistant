import ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, unlinkSync, readdirSync } from 'fs';
import { tmpdir } from 'os';

class VideoProcessor {
    constructor() {
        this.currentTaskId = null;
        this.isProcessing = false;
    }

    // 生成唯一的任务ID
    generateTaskId() {
        return `video_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 取消当前任务
    cancelCurrentTask() {
        if (this.currentTaskId) {
            this.currentTaskId = null;
            this.isProcessing = false;
        }
    }

    // 提取视频帧
    async extractVideoFrames(videoPath, progressCallback) {
        return new Promise((resolve, reject) => {
            // 生成新的任务ID
            const taskId = this.generateTaskId();
            this.currentTaskId = taskId;
            this.isProcessing = true;

            // 创建临时目录
            const tempDir = join(tmpdir(), `video_frames_${taskId}`);
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir, { recursive: true });
            }

            let totalFrames = 0;
            let processedFrames = 0;
            const frames = [];

            // 首先获取视频信息
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    this.cleanup(tempDir);
                    reject(new Error(`Failed to probe video: ${err.message}`));
                    return;
                }

                // 检查任务是否被取消
                if (this.currentTaskId !== taskId) {
                    this.cleanup(tempDir);
                    reject(new Error('Task was cancelled'));
                    return;
                }

                const duration = metadata.format.duration;
                const fps = metadata.streams.find(s => s.codec_type === 'video')?.r_frame_rate;
                
                const [num, den] = fps.split('/').map(Number);
                const frameRate = num / den;
                totalFrames = Math.floor(duration * frameRate);

                const outputPattern = join(tempDir, 'frame_%06d.jpg');
                
                const command = ffmpeg(videoPath)
                    .outputOptions([
                        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', // 确保宽高为偶数
                        '-q:v', '2' // 质量
                    ])
                    .output(outputPattern)
                    .on('start', (commandLine) => {
                        if (progressCallback) {
                            progressCallback({
                                type: 'start',
                                taskId,
                                totalFrames,
                                message: `Starting extracting`
                            });
                        }
                    })
                    .on('progress', (progress) => {
                        // 检查任务是否被取消
                        if (this.currentTaskId !== taskId) {
                            command.kill('SIGKILL');
                            return;
                        }

                        if (progress.frames) {
                            processedFrames = progress.frames;
                            if (progressCallback) {
                                progressCallback({
                                    type: 'progress',
                                    taskId,
                                    processedFrames,
                                    totalFrames,
                                    percent: Math.round((processedFrames / totalFrames) * 100),
                                    message: `Extracted ${processedFrames} frames`
                                });
                            }
                        }
                    })
                    .on('end', async () => {
                        // 检查任务是否被取消
                        if (this.currentTaskId !== taskId) {
                            this.cleanup(tempDir);
                            reject(new Error('Task was cancelled'));
                            return;
                        }

                        try {
                            // 读取所有生成的帧文件
                            const frameFiles = readdirSync(tempDir).filter(file => file.startsWith('frame_') && file.endsWith('.jpg')).sort();

                            for (const frameFile of frameFiles) {
                                const framePath = join(tempDir, frameFile);
                                const frameBuffer = readFileSync(framePath);
                                const base64Data = `data:image/jpeg;base64,${frameBuffer.toString('base64')}`;
                                frames.push(base64Data);

                                // 发送加载进度
                                if (progressCallback) {
                                    progressCallback({
                                        type: 'loading',
                                        taskId,
                                        loadedFrames: frames.length,
                                        totalFrames: frameFiles.length,
                                        percent: Math.round((frames.length / frameFiles.length) * 100),
                                        message: `${frames.length} frames loaded`
                                    });
                                }
                            }

                            // 清理临时文件
                            this.cleanup(tempDir);
                            
                            this.isProcessing = false;
                            
                            if (progressCallback) {
                                progressCallback({
                                    type: 'complete',
                                    taskId,
                                    totalFrames: frames.length,
                                    message: `Successfully extracted ${frames.length} frames`
                                });
                            }

                            resolve({
                                taskId,
                                frames,
                                totalFrames: frames.length,
                                duration: duration
                            });

                        } catch (error) {
                            this.cleanup(tempDir);
                            this.isProcessing = false;
                            reject(new Error(`Failed to process frames: ${error.message}`));
                        }
                    })
                    .on('error', (err) => {
                        console.error('FFmpeg error:', err);
                        this.cleanup(tempDir);
                        this.isProcessing = false;
                        
                        if (this.currentTaskId === taskId) {
                            reject(new Error(`FFmpeg processing failed: ${err.message}`));
                        } else {
                            reject(new Error('Task was cancelled'));
                        }
                    });

                command.run();
            });
        });
    }

    // 清理临时文件
    cleanup(tempDir) {
        try {
            if (existsSync(tempDir)) {
                const files = readdirSync(tempDir);
                for (const file of files) {
                    unlinkSync(join(tempDir, file));
                }
                setTimeout(() => {
                    try {
                        if (existsSync(tempDir)) {
                            require('fs').rmdirSync(tempDir);
                        }
                    } catch (e) {
                        console.warn('Could not remove temp directory:', e.message);
                    }
                }, 100);
            }
        } catch (error) {
            console.warn('Cleanup error:', error.message);
        }
    }

    getStatus() {
        return {
            isProcessing: this.isProcessing,
            currentTaskId: this.currentTaskId
        };
    }
}

const videoProcessor = new VideoProcessor();

export async function videoExtract(videoPath) {
    try {
        const result = await videoProcessor.extractVideoFrames(videoPath, (progress) => {
            const mainWindow = global.existedWindows?.get('main');
            if (mainWindow) {
                mainWindow.webContents.send('video-extraction-progress', progress);
            }
        });
        
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('Video extraction error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}