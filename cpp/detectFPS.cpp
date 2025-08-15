#include <opencv2/opencv.hpp>
#include <iostream>

int main(int argc, char** argv) {
    // 检查是否提供了视频文件路径
    if (argc != 2) {
        std::cout << "Usage: " << argv[0] << " <video_file_path>" << std::endl;
        return -1;
    }

    // 创建视频捕获对象
    cv::VideoCapture cap(argv[1]);
    
    // 检查视频是否成功打开
    if (!cap.isOpened()) {
        std::cerr << "Error: Could not open video file " << argv[1] << std::endl;
        return -1;
    }

    // 获取视频的帧率
    double fps = cap.get(cv::CAP_PROP_FPS);
    
    // 输出帧率信息
    std::cout << "Video frame rate: " << fps << " FPS" << std::endl;

    // 可选：逐帧读取并处理视频
    cv::Mat frame;
    while (cap.read(frame)) {
        // 在这里可以添加对每一帧的处理代码
        // 例如显示帧：
        cv::imshow("Video Frame", frame);
        
        // 按ESC键退出
        if (cv::waitKey(30) == 27) {
            break;
        }
    }

    // 释放资源
    cap.release();
    cv::destroyAllWindows();

    return 0;
}