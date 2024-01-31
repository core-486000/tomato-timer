# 依存関係をインストール
yarn install

# prisma/schema.prisma の内容をデータベースに反映
npx prisma db push

# アプリケーションを起動
yarn start