import { client } from '../../libs/microcms';

// 型定義
export type Post = {
  id: string;
  title: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  category?: Category[]; // categoryを Category[] 型に変更
  tag?: {
    id: string;
    name: string;
  }[];
  publishedAt: string;
  body?: string;
  revisedAt?: string;
};

export type Category = {
  id: string;
  name: string;
};


// カテゴリーを取得
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await client.get({
      endpoint: 'categories',
      queries: {
        limit: 100,
      },
    });
    
    if (!data || !data.contents || !Array.isArray(data.contents)) {
      return [];
    }
    
    return data.contents.map((content: any) => ({
      id: content.id,
      name: content.name
    }));
  } catch (error) {
    console.error('カテゴリー取得エラー:', error);
    return [];
  }
}



// 最新記事を取得
export async function getLatestPosts(limit = 5): Promise<Post[]> {
  try {
    const data = await client.get({
      endpoint: 'blog',
      queries: {
        fields: 'id,title',
        limit: limit,
      },
    });
    
    if (!data || !data.contents || !Array.isArray(data.contents)) {
      return [];
    }
    
    return data.contents;
  } catch (error) {
    console.error('最新記事取得エラー:', error);
    return [];
  }
}
