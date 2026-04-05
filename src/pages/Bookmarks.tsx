import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/feed/PostCard";
import { Bookmark } from "lucide-react";

const Bookmarks = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", user.id);

    if (!bookmarks?.length) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postIds = bookmarks.map((b) => b.post_id);
    const { data: postsData } = await supabase
      .from("posts")
      .select("*, profiles!posts_user_id_fkey(full_name, avatar_url, branch)")
      .in("id", postIds)
      .order("created_at", { ascending: false });

    const { data: likesData } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id);

    setPosts(postsData || []);
    setLikedPosts(new Set((likesData || []).map((l) => l.post_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Bookmarks</h2>
      </div>
      {!loading && posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No bookmarks yet</p>
          <p className="text-sm mt-1">Save posts to find them later</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedPosts.has(post.id)}
            isBookmarked={true}
            onRefresh={fetchBookmarks}
          />
        ))
      )}
    </div>
  );
};

export default Bookmarks;
