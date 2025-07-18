#!/bin/bash

# 设置错误时退出
set -e

# 获取当前分支名
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 只在 master 分支执行
if [ "$BRANCH" != "master" ]; then
  echo "当前不是 master 分支，跳过构建和推送"
  exit 0
fi

# 读取 Docker Hub 用户名
if [ -f ".env" ]; then
  source .env
fi

if [ -z "$DOCKERHUB_USERNAME" ]; then
  echo "请在 .env 文件中设置 DOCKERHUB_USERNAME"
  exit 1
fi

echo "开始构建 Docker 镜像..."
docker build -t $DOCKERHUB_USERNAME/move-to-learn-next:latest .

echo "推送镜像到 Docker Hub..."
docker push $DOCKERHUB_USERNAME/move-to-learn-next:latest

echo "镜像构建和推送完成！" 