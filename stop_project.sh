#!/bin/bash

# ChUseA AI Writing Tool - 项目停止脚本
# 停止前端和后端服务

set -e

echo "⏹️  停止 ChUseA AI Writing Tool 服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 停止服务函数
stop_service() {
    local service_name=$1
    local pid_file=$2
    local port=$3
    
    print_status "停止 $service_name 服务..."
    
    # 从PID文件停止
    if [ -f "$pid_file" ]; then
        PID=$(cat $pid_file)
        if kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null
            sleep 2
            if kill -0 $PID 2>/dev/null; then
                print_warning "使用 SIGKILL 强制停止 $service_name (PID: $PID)"
                kill -9 $PID 2>/dev/null || true
            fi
            print_success "$service_name 服务已停止 (PID: $PID)"
        else
            print_warning "$service_name PID文件存在但进程不存在"
        fi
        rm -f $pid_file
    fi
    
    # 通过端口查找并停止
    if [ -n "$port" ]; then
        PIDS=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            print_status "发现端口 $port 上的进程，正在停止..."
            echo $PIDS | xargs kill -TERM 2>/dev/null || true
            sleep 2
            PIDS=$(lsof -ti:$port 2>/dev/null || true)
            if [ -n "$PIDS" ]; then
                print_warning "使用 SIGKILL 强制停止端口 $port 上的进程"
                echo $PIDS | xargs kill -9 2>/dev/null || true
            fi
            print_success "端口 $port 已释放"
        fi
    fi
}

# 停止服务进程
stop_by_name() {
    local process_name=$1
    local description=$2
    
    PIDS=$(pgrep -f "$process_name" 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        print_status "停止 $description 进程..."
        echo $PIDS | xargs kill -TERM 2>/dev/null || true
        sleep 2
        PIDS=$(pgrep -f "$process_name" 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            print_warning "强制停止 $description 进程"
            echo $PIDS | xargs kill -9 2>/dev/null || true
        fi
        print_success "$description 进程已停止"
    fi
}

# 主停止逻辑
main() {
    echo "=========================================="
    echo "  停止 ChUseA 服务"
    echo "=========================================="
    echo ""
    
    # 停止前端服务 (Next.js)
    stop_service "前端" "frontend.pid" "3000"
    stop_by_name "next dev" "Next.js 开发服务器"
    
    # 停止后端服务 (FastAPI)
    stop_service "后端" "backend.pid" "8002"
    stop_by_name "start_server.py" "FastAPI 服务器"
    
    # 清理日志文件的进程ID记录
    print_status "清理临时文件..."
    rm -f backend.pid frontend.pid
    
    # 验证端口释放
    print_status "验证端口状态..."
    
    for port in 3000 8002; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "端口 $port 仍被占用"
        else
            print_success "端口 $port 已释放"
        fi
    done
    
    echo ""
    print_success "🎉 所有服务已停止"
    echo ""
    print_status "💡 提示:"
    echo "  - 重新启动服务: ./start_project.sh"
    echo "  - 查看日志文件: backend.log, frontend.log"
    echo "  - 如有端口占用问题，请手动检查: lsof -i :3000 -i :8002"
}

# 运行主函数
main "$@"