import { client } from '../../libs/microcms';

export type ArchiveItem = {
  year: string;
  month: string;
  count: number;
};

// 記事データから年月ごとのアーカイブを作成する
export async function getArchives(): Promise<ArchiveItem[]> {
  try {
    // 全記事の公開日時を取得
    const data = await client.get({
      endpoint: 'blog',
      queries: {
        fields: 'publishedAt',
        limit: 100,
      },
    });
    
    // APIレスポンスがない場合や記事がない場合は空配列を返す
    if (!data || !data.contents || !Array.isArray(data.contents) || data.contents.length === 0) {
      return [];
    }
    
    // 年月ごとの記事数をカウント
    const archiveMap = new Map<string, number>();
    
    data.contents.forEach((post: any) => {
      // publishedAtが存在することを確認
      if (!post || !post.publishedAt) return;
      
      try {
        const date = new Date(post.publishedAt);
        // 無効な日付でないことを確認
        if (isNaN(date.getTime())) return;
        
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const key = `${year}-${month}`;
        
        archiveMap.set(key, (archiveMap.get(key) || 0) + 1);
      } catch (e) {
        // 日付処理エラーは無視
      }
    });
    
    // MapからArrayに変換して整形
    const archives = Array.from(archiveMap).map(([key, count]) => {
      const [year, month] = key.split('-');
      return {
        year,
        month,
        count
      };
    });
    
    // 新しい順に並べ替え
    const sortedArchives = archives.sort((a, b) => {
      if (a.year !== b.year) {
        return parseInt(b.year) - parseInt(a.year); // 年の降順
      }
      return parseInt(b.month) - parseInt(a.month); // 月の降順
    });
    
    // アーカイブデータを返す (空の場合も含む)
    return sortedArchives;
  } catch (error) {
    console.error('アーカイブデータ取得エラー:', error);
    return []; // エラー時も空配列を返す
  }
}
