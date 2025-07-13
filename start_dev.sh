#!/bin/bash

# AI写作工具 - 开发启动脚本

set -e

echo "🚀 正在启动 AI 写作工具开发环境..."

# 检查依赖
echo "📋 检查系统依赖..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+ 版本"
    exit 1
fi

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python 3.12+ 版本"
    exit 1
fi

# 检查 Redis (可选)
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis 未安装，将使用内存缓存（推荐安装 Redis 以获得更好性能）"
fi

echo "✅ 依赖检查完成"

# 启动后端
echo "🔧 启动后端服务..."
cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "🔧 创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "📦 安装后端依赖..."
pip install -r requirements.txt

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "📝 创建环境配置文件..."
    cp .env.example .env || echo "⚠️  请手动创建 .env 文件并配置必要的环境变量"
fi

# 启动Redis (如果可用)
if command -v redis-server &> /dev/null; then
    echo "🔴 启动 Redis..."
    redis-server --daemonize yes --maxmemory 256mb --maxmemory-policy allkeys-lru
fi

# 启动后端服务
echo "🔧 启动 FastAPI 服务器..."
python start_server.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 检查后端健康状态
if curl -f http://localhost:8002/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# 启动前端
echo "🎨 启动前端服务..."
cd ../new-frontend

# 安装依赖
echo "📦 安装前端依赖..."
npm install

# 启动前端开发服务器
echo "🎨 启动 Next.js 开发服务器..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# 等待前端启动
echo "⏳ 等待前端服务启动..."
sleep 10

echo ""
echo "🎉 AI 写作工具启动完成！"
echo ""
echo "📍 服务地址："
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:8002"
echo "   API文档: http://localhost:8002/docs"
echo ""
echo "📋 功能状态："
echo "   ✅ 循环引擎 (Plan→Draft→Citation→Grammar→Readability)"
echo "   ✅ 可读性检测 (Flesch-Kincaid算法)"
echo "   ✅ WebSocket实时通信"
echo "   ✅ 引用验证系统"
echo "   ✅ Redis缓存支持"
echo "   ✅ 富文本编辑器"
echo "   ✅ 响应式界面"
echo ""
echo "🔧 使用说明："
echo "   1. 在浏览器中打开 http://localhost:3000"
echo "   2. 注册/登录账户"
echo "   3. 输入写作主题，点击「开始」"
echo "   4. 观察自动化写作流程"
echo "   5. 通过聊天面板与AI交互"
echo ""
echo "⛔ 停止服务："
echo "   按 Ctrl+C 或运行: ./stop_dev.sh"
echo ""

# 创建停止脚本
cat > ../stop_dev.sh << 'EOF'
#!/bin/bash
echo "🛑 正在停止 AI 写作工具..."

# 停止前端和后端进程
pkill -f "npm run dev" || true
pkill -f "start_server.py" || true
pkill -f "uvicorn main:app" || true

# 停止Redis (如果是通过脚本启动的)
redis-cli shutdown 2>/dev/null || true

echo "✅ 服务已停止"
EOF

chmod +x ../stop_dev.sh

# 等待用户中断
echo "按 Ctrl+C 停止所有服务..."
trap 'echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; ../stop_dev.sh; exit 0' INT

# 保持脚本运行
wait