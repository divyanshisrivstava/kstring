import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: postsData } = await supabase
      .from("posts")
      .select("*, profiles!posts_user_id_fkey(full_name, avatar_url, branch)")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: likesData } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id);

    const { data: bookmarksData } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", user.id);

    setPosts(postsData || []);
    setLikedPosts(new Set((likesData || []).map((l) => l.post_id)));
    setBookmarkedPosts(new Set((bookmarksData || []).map((b) => b.post_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="max-w-2xl mx-auto">
      <CreatePost onPostCreated={fetchPosts} />

      {loading ? (
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b border-border">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedPosts.has(post.id)}
            isBookmarked={bookmarkedPosts.has(post.id)}
            onRefresh={fetchPosts}
          />
        ))
      )}
    </div>
  );
};

export default Feed;
