#!/bin/bash

# ChUseA AI Writing Tool - 项目启动脚本
# 在固定端口启动前端和后端服务

set -e

echo "🚀 启动 ChUseA AI Writing Tool..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
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

# 检查是否在项目根目录
if [ ! -f "start_project.sh" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 端口配置
BACKEND_PORT=8002
FRONTEND_PORT=3000

print_status "服务端口配置:"
echo "  - 后端 (FastAPI): http://localhost:${BACKEND_PORT}"
echo "  - 前端 (Next.js): http://localhost:${FRONTEND_PORT}"
echo ""

# 检查端口是否被占用
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "$service 端口 $port 已被占用"
        echo "正在检查是否为目标服务..."
        
        if [ "$port" = "$BACKEND_PORT" ]; then
            # 检查后端健康状态
            if curl -f http://localhost:$port/health >/dev/null 2>&1; then
                print_success "后端服务已经在运行中"
                return 0
            fi
        elif [ "$port" = "$FRONTEND_PORT" ]; then
            # 检查前端状态
            if curl -f http://localhost:$port >/dev/null 2>&1; then
                print_success "前端服务已经在运行中"
                return 0
            fi
        fi
        
        print_error "端口 $port 被其他进程占用，请手动处理"
        exit 1
    fi
    return 1
}

# 启动后端服务
start_backend() {
    print_status "启动后端服务..."
    
    if check_port $BACKEND_PORT "后端"; then
        return 0
    fi
    
    cd backend
    
    # 检查虚拟环境
    if [ ! -d "venv" ]; then
        print_warning "未找到虚拟环境，正在创建..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 检查并安装依赖
    print_status "检查后端依赖..."
    pip install -r requirements.txt >/dev/null 2>&1
    
    # 启动服务
    print_status "启动 FastAPI 服务在端口 ${BACKEND_PORT}..."
    python start_server.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    cd ..
    
    # 等待服务启动
    print_status "等待后端服务启动..."
    for i in {1..10}; do
        sleep 2
        if curl -f http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
            print_success "后端服务启动成功 (PID: $BACKEND_PID)"
            echo $BACKEND_PID > backend.pid
            return 0
        fi
        echo -n "."
    done
    
    print_error "后端服务启动失败"
    return 1
}

# 启动前端服务
start_frontend() {
    print_status "启动前端服务..."
    
    if check_port $FRONTEND_PORT "前端"; then
        return 0
    fi
    
    cd frontend/new-frontend
    
    # 检查并安装依赖
    print_status "检查前端依赖..."
    if [ ! -d "node_modules" ]; then
        print_status "安装前端依赖..."
        npm ci
    fi
    
    # 启动服务
    print_status "启动 Next.js 服务在端口 ${FRONTEND_PORT}..."
    PORT=$FRONTEND_PORT npm run dev > ../../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    cd ../..
    
    # 等待服务启动
    print_status "等待前端服务启动..."
    for i in {1..15}; do
        sleep 2
        if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            print_success "前端服务启动成功 (PID: $FRONTEND_PID)"
            echo $FRONTEND_PID > frontend.pid
            return 0
        fi
        echo -n "."
    done
    
    print_error "前端服务启动失败"
    return 1
}

# 验证服务状态
verify_services() {
    print_status "验证服务状态..."
    
    # 检查后端
    if curl -f http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        print_success "✅ 后端服务运行正常"
        echo "   - 健康检查: http://localhost:$BACKEND_PORT/health"
        echo "   - API文档: http://localhost:$BACKEND_PORT/docs"
    else
        print_error "❌ 后端服务异常"
    fi
    
    # 检查前端
    if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        print_success "✅ 前端服务运行正常"
        echo "   - 主页面: http://localhost:$FRONTEND_PORT"
        echo "   - Demo页面: http://localhost:$FRONTEND_PORT/demo"
        echo "   - 聊天页面: http://localhost:$FRONTEND_PORT/chat"
    else
        print_error "❌ 前端服务异常"
    fi
}

# 显示使用指南
show_usage() {
    echo ""
    print_status "🎉 服务启动完成！"
    echo ""
    echo "📍 访问地址:"
    echo "  🖥️  前端应用: http://localhost:$FRONTEND_PORT"
    echo "  🔧 后端API: http://localhost:$BACKEND_PORT"
    echo "  📚 API文档: http://localhost:$BACKEND_PORT/docs"
    echo ""
    echo "📂 功能页面:"
    echo "  🏠 主页: http://localhost:$FRONTEND_PORT"
    echo "  🎨 Demo: http://localhost:$FRONTEND_PORT/demo"
    echo "  💬 聊天: http://localhost:$FRONTEND_PORT/chat"
    echo ""
    echo "📋 管理命令:"
    echo "  停止服务: ./stop_project.sh"
    echo "  查看日志: tail -f backend.log frontend.log"
    echo "  重启服务: ./stop_project.sh && ./start_project.sh"
    echo ""
    echo "💡 提示: 按 Ctrl+C 退出此脚本但保持服务运行"
}

# 清理函数
cleanup() {
    print_status "清理资源..."
    
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm backend.pid
    fi
    
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm frontend.pid
    fi
    
    print_success "清理完成"
}

# 信号处理
trap cleanup EXIT INT TERM

# 主函数
main() {
    echo "=========================================="
    echo "  ChUseA AI Writing Tool"
    echo "  项目启动脚本"
    echo "=========================================="
    echo ""
    
    # 启动服务
    if start_backend && start_frontend; then
        verify_services
        show_usage
        
        # 保持脚本运行
        echo ""
        print_status "服务正在运行中..."
        print_status "按 Ctrl+C 退出脚本但保持服务运行"
        print_status "或使用 ./stop_project.sh 停止所有服务"
        
        # 等待用户中断
        while true; do
            sleep 1
        done
    else
        print_error "服务启动失败"
        cleanup
        exit 1
    fi
}

# 运行主函数
main "$@"