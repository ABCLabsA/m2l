#!/bin/bash

# 部署脚本 - Move to Learn Next.js 前端项目
# 使用方法: ./deploy.sh [--rollback] [--dry-run]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 配置变量
PROJECT_NAME="move-to-learn-next"
SERVER_USER="root"
SERVER_HOST="accc.space"
SERVER_PATH="/var/www/move-to-learn-next-app"
LOCAL_BUILD_DIR="./build-temp"

# 解析命令行参数
ROLLBACK=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  --rollback    回滚到上一个版本"
            echo "  --dry-run     试运行，不实际执行部署"
            echo "  -h, --help    显示此帮助信息"
            exit 0
            ;;
        *)
            print_error "未知选项: $1"
            exit 1
            ;;
    esac
done

# 验证配置
validate_config() {
    print_info "验证配置..."
    
    # 检查必要的命令
    for cmd in rsync ssh scp tar; do
        if ! command -v $cmd &> /dev/null; then
            print_error "缺少必要命令: $cmd"
            exit 1
        fi
    done
    
    # 检查SSH连接
    if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'SSH连接测试成功'" &> /dev/null; then
        print_error "无法连接到服务器 ${SERVER_HOST}"
        exit 1
    fi
    
    print_success "配置验证通过"
}

# 回滚功能
rollback() {
    print_info "开始回滚到上一个版本..."
    
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

PROJECT_NAME="move-to-learn-next"
SERVER_PATH="/var/www/move-to-learn-next-app"

# 查找最新的备份
LATEST_BACKUP=$(ls -1t ${SERVER_PATH}.backup.* 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 没有找到备份文件"
    exit 1
fi

echo "🔄 停止当前应用..."
pm2 stop $PROJECT_NAME || true

echo "📦 恢复备份: $LATEST_BACKUP"
if [ -d "$SERVER_PATH" ]; then
    sudo rm -rf $SERVER_PATH
fi
sudo mv $LATEST_BACKUP $SERVER_PATH
sudo chown -R $USER:$USER $SERVER_PATH

echo "🚀 重启应用..."
cd $SERVER_PATH
pm2 start ecosystem.config.js

echo "✅ 回滚完成!"
ENDSSH
    
    print_success "回滚完成! 访问 https://$SERVER_HOST 查看结果"
    exit 0
}

# 如果是回滚模式
if [ "$ROLLBACK" = true ]; then
    validate_config
    rollback
fi

print_info "🚀 开始部署 $PROJECT_NAME 到 $SERVER_HOST"

if [ "$DRY_RUN" = true ]; then
    print_warning "试运行模式：不会实际执行部署操作"
fi

# 验证配置
validate_config

# 1. 清理本地构建目录
print_info "📦 清理本地构建目录..."
if [ "$DRY_RUN" = false ]; then
    rm -rf $LOCAL_BUILD_DIR
    mkdir -p $LOCAL_BUILD_DIR
else
    echo "试运行: 清理和创建 $LOCAL_BUILD_DIR"
fi

# 2. 复制项目文件（排除不需要的文件）
print_info "📋 复制项目文件..."
if [ "$DRY_RUN" = false ]; then
    rsync -av --progress \
      --exclude='node_modules' \
      --exclude='.next' \
      --exclude='.git' \
      --exclude='*.log' \
      --exclude='.env*' \
      --exclude='build-temp' \
      --exclude='._*' \
      --exclude='.DS_Store' \
      --exclude='.AppleDouble' \
      --exclude='.LSOverride' \
      --exclude='*.tar.gz' \
      ./ $LOCAL_BUILD_DIR/
else
    echo "试运行: 复制项目文件到 $LOCAL_BUILD_DIR"
fi

# 3. 打包项目
print_info "📦 打包项目..."
if [ "$DRY_RUN" = false ]; then
    cd $LOCAL_BUILD_DIR
    tar -czf ../${PROJECT_NAME}.tar.gz .
    cd ..
    print_success "打包完成，文件大小: $(du -h ${PROJECT_NAME}.tar.gz | cut -f1)"
else
    echo "试运行: 打包项目为 ${PROJECT_NAME}.tar.gz"
fi

# 4. 上传到服务器
print_info "⬆️  上传到服务器..."
if [ "$DRY_RUN" = false ]; then
    scp ${PROJECT_NAME}.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
    print_success "上传完成"
else
    echo "试运行: 上传 ${PROJECT_NAME}.tar.gz 到服务器"
fi

# 5. 在服务器上部署
print_info "🔧 在服务器上部署..."
if [ "$DRY_RUN" = false ]; then
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

PROJECT_NAME="move-to-learn-next"
SERVER_PATH="/var/www/move-to-learn-next-app"

echo "⏸️  停止应用..."
pm2 stop $PROJECT_NAME || true

echo "💾 备份当前版本..."
if [ -d "$SERVER_PATH" ]; then
    sudo mv $SERVER_PATH ${SERVER_PATH}.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ 备份完成"
fi

echo "📁 创建新目录..."
sudo mkdir -p $SERVER_PATH
sudo chown -R $USER:$USER $SERVER_PATH

echo "📦 解压新版本..."
cd $SERVER_PATH
tar -xzf /tmp/${PROJECT_NAME}.tar.gz

echo "🧹 清理系统文件..."
find . -name "._*" -type f -delete
find . -name ".DS_Store" -type f -delete

echo "📝 创建日志目录..."
mkdir -p logs

echo "📚 安装依赖..."
pnpm install --frozen-lockfile

echo "🔨 构建项目..."
# 设置构建时的环境变量
export NODE_ENV=production
export NEXT_PUBLIC_AI_API_URL=https://api.move-to-learn.accc.space
export AI_API_URL=https://api.move-to-learn.accc.space
export BACKEND_URL=https://api.move-to-learn.accc.space
pnpm run build

echo "🚀 启动应用..."
pm2 start ecosystem.config.js

echo "💾 保存 PM2 配置..."
pm2 save

echo "🗑️  清理临时文件..."
rm -f /tmp/${PROJECT_NAME}.tar.gz

echo "✅ 服务器部署完成!"
ENDSSH
else
    echo "试运行: 在服务器上执行部署步骤"
fi

# 6. 清理本地文件
print_info "🧹 清理本地文件..."
if [ "$DRY_RUN" = false ]; then
    rm -rf $LOCAL_BUILD_DIR
    rm -f ${PROJECT_NAME}.tar.gz
    print_success "本地清理完成"
else
    echo "试运行: 清理本地临时文件"
fi

if [ "$DRY_RUN" = false ]; then
    print_success "🎉 部署完成! 访问 https://$SERVER_HOST 查看结果"

    # 7. 显示应用状态
    print_info "📊 应用状态:"
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 status" 
    
    print_info "💡 小贴士:"
    echo "  - 如需回滚: ./deploy.sh --rollback"
    echo "  - 查看日志: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${PROJECT_NAME}'"
    echo "  - 重启应用: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 restart ${PROJECT_NAME}'"
else
    print_success "试运行完成，所有步骤验证通过"
fi