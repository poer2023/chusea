#!/bin/bash

# AI Writing Tool - 完整测试套件运行脚本
# 这个脚本会运行前端和后端的所有测试

set -e  # 遇到错误时退出

echo "🚀 开始运行 AI Writing Tool 完整测试套件..."

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

# 检查必要的依赖
check_dependencies() {
    print_status "检查依赖..."
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 未安装"
        exit 1
    fi
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        exit 1
    fi
    
    print_success "所有依赖检查通过"
}

# 设置环境变量
setup_env() {
    print_status "设置测试环境变量..."
    export TEST_MODE=true
    export DATABASE_URL=${DATABASE_URL:-"sqlite:///./test.db"}
    export REDIS_URL=${REDIS_URL:-"redis://localhost:6379/1"}
    print_success "环境变量设置完成"
}

# 运行后端测试
run_backend_tests() {
    print_status "开始运行后端测试..."
    
    cd backend
    
    # 检查是否有虚拟环境
    if [ ! -d "venv" ]; then
        print_warning "未找到虚拟环境，正在创建..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    print_status "安装后端依赖..."
    pip install -r requirements.txt
    pip install pytest-cov pytest-xdist pytest-benchmark
    
    # 运行数据库迁移
    print_status "运行数据库迁移..."
    alembic upgrade head
    
    # 运行单元测试
    print_status "运行后端单元测试..."
    pytest tests/ -v --cov=. --cov-report=term-missing --cov-report=html -x
    
    # 运行集成测试
    print_status "运行后端集成测试..."
    pytest tests/test_*_integration.py -v --maxfail=3
    
    # 运行API测试
    print_status "运行API端点测试..."
    pytest tests/test_api_endpoints.py -v
    
    # 运行性能测试
    print_status "运行性能测试..."
    pytest tests/test_performance.py -v --maxfail=1
    
    cd ..
    print_success "后端测试完成"
}

# 运行前端测试
run_frontend_tests() {
    print_status "开始运行前端测试..."
    
    cd frontend/new-frontend
    
    # 安装依赖
    print_status "安装前端依赖..."
    npm ci
    
    # 运行类型检查
    print_status "运行TypeScript类型检查..."
    npm run type-check
    
    # 运行代码检查
    print_status "运行代码风格检查..."
    npm run lint
    npm run format:check
    
    # 运行单元测试
    print_status "运行前端单元测试..."
    npm run test:run
    
    # 运行单元测试覆盖率
    print_status "运行测试覆盖率分析..."
    npm run test:coverage
    
    # 构建检查
    print_status "运行构建检查..."
    npm run build
    
    cd ../..
    print_success "前端测试完成"
}

# 运行E2E测试
run_e2e_tests() {
    print_status "开始运行E2E测试..."
    
    # 启动后端服务器
    print_status "启动后端服务器..."
    cd backend
    source venv/bin/activate
    python start_server.py &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    print_status "等待后端服务启动..."
    sleep 10
    
    # 检查后端是否启动成功
    if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_error "后端服务启动失败"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # 启动前端服务器
    print_status "启动前端服务器..."
    cd frontend/new-frontend
    npm start &
    FRONTEND_PID=$!
    cd ../..
    
    # 等待前端启动
    print_status "等待前端服务启动..."
    sleep 15
    
    # 检查前端是否启动成功
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_error "前端服务启动失败"
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # 运行E2E测试
    print_status "运行Playwright E2E测试..."
    cd frontend/new-frontend
    npm run test:e2e
    cd ../..
    
    # 清理进程
    print_status "清理测试服务..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    
    print_success "E2E测试完成"
}

# 生成测试报告
generate_reports() {
    print_status "生成测试报告..."
    
    # 创建报告目录
    mkdir -p test-reports
    
    # 复制覆盖率报告
    if [ -d "backend/htmlcov" ]; then
        cp -r backend/htmlcov test-reports/backend-coverage
        print_success "后端覆盖率报告已保存到 test-reports/backend-coverage/"
    fi
    
    if [ -d "frontend/new-frontend/coverage" ]; then
        cp -r frontend/new-frontend/coverage test-reports/frontend-coverage
        print_success "前端覆盖率报告已保存到 test-reports/frontend-coverage/"
    fi
    
    # 复制Playwright报告
    if [ -d "frontend/new-frontend/playwright-report" ]; then
        cp -r frontend/new-frontend/playwright-report test-reports/e2e-report
        print_success "E2E测试报告已保存到 test-reports/e2e-report/"
    fi
    
    print_success "所有测试报告已生成"
}

# 清理函数
cleanup() {
    print_status "清理测试环境..."
    
    # 停止可能还在运行的服务
    pkill -f "start_server.py" 2>/dev/null || true
    pkill -f "next start" 2>/dev/null || true
    
    # 清理临时文件
    rm -f backend/test.db* 2>/dev/null || true
    
    print_success "清理完成"
}

# 信号处理
trap cleanup EXIT INT TERM

# 主函数
main() {
    echo "=========================================="
    echo "  AI Writing Tool - 完整测试套件"
    echo "=========================================="
    echo
    
    # 解析命令行参数
    SKIP_E2E=false
    SKIP_BACKEND=false
    SKIP_FRONTEND=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-e2e)
                SKIP_E2E=true
                shift
                ;;
            --skip-backend)
                SKIP_BACKEND=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            --help|-h)
                echo "用法: $0 [选项]"
                echo "选项:"
                echo "  --skip-e2e      跳过E2E测试"
                echo "  --skip-backend  跳过后端测试"
                echo "  --skip-frontend 跳过前端测试"
                echo "  --help, -h      显示此帮助信息"
                exit 0
                ;;
            *)
                print_error "未知选项: $1"
                exit 1
                ;;
        esac
    done
    
    # 开始测试流程
    check_dependencies
    setup_env
    
    if [ "$SKIP_BACKEND" = false ]; then
        run_backend_tests
    else
        print_warning "跳过后端测试"
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        run_frontend_tests
    else
        print_warning "跳过前端测试"
    fi
    
    if [ "$SKIP_E2E" = false ]; then
        run_e2e_tests
    else
        print_warning "跳过E2E测试"
    fi
    
    generate_reports
    
    echo
    echo "=========================================="
    print_success "所有测试完成！"
    echo "=========================================="
    echo
    print_status "测试报告位置:"
    echo "  - 后端覆盖率: test-reports/backend-coverage/index.html"
    echo "  - 前端覆盖率: test-reports/frontend-coverage/index.html"
    echo "  - E2E测试报告: test-reports/e2e-report/index.html"
    echo
    print_status "要查看详细报告，请在浏览器中打开上述HTML文件"
}

# 运行主函数
main "$@"