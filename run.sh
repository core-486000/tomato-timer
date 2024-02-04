# 依存関係をインストール
yarn install

# prisma/schema.prismaの内容をデータベースに反映
npx prisma db push

# Prismaクライアントを作成
npx prisma generate

# アプリケーションを起動
yarn start