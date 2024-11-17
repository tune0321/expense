# ベースイメージとしてNode.js 20を使用
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージマネージャーのキャッシュを活用するため、依存関係ファイルを先にコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションのビルド
RUN npm run build

# ポート3000を公開
EXPOSE 3000

# アプリケーションの起動
CMD ["npm", "start"]
