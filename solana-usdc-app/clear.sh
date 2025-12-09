# 1. 停止 Expo 服务
# 2. 删除核心缓存
rm -rf .expo/ node_modules/.cache/ tsconfig.tsbuildinfo
# 3. 清理 npm 缓存
npm cache clean --force
# 4. 重新安装依赖
rm -rf node_modules package-lock.json
npm install
# 5. 清理并重启 Expo
npx expo start --clear

