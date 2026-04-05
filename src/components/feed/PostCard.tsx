import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url: string | null;
    hashtags: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    user_id: string;
    profiles?: {
      full_name: string;
      avatar_url: string;
      branch: string;
    };
  };
  isLiked: boolean;
  isBookmarked: boolean;
  onRefresh: () => void;
}

const PostCard = ({ post, isLiked, isBookmarked, onRefresh }: PostCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = async () => {
    if (!user) return;
    try {
      if (liked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
        setLikesCount((c) => c - 1);
      } else {
        await supabase.from("likes").insert({ user_id: user.id, post_id: post.id });
        setLikesCount((c) => c + 1);
      }
      setLiked(!liked);
    } catch {
      toast.error("Failed to update like");
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      if (bookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("post_id", post.id);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, post_id: post.id });
      }
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  const profile = post.profiles;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const renderContent = (text: string) => {
    return text.split(/(#\w+)/g).map((part, i) =>
      part.startsWith("#") ? (
        <span key={i} className="text-primary font-medium cursor-pointer hover:underline">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="p-4 border-b border-border hover:bg-muted/30 transition-colors">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-[15px] truncate">
              {profile?.full_name || "Anonymous"}
            </span>
            <span className="text-muted-foreground text-sm truncate">
              {profile?.branch}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm flex-shrink-0">{timeAgo}</span>
          </div>

          <p className="text-foreground text-[15px] leading-relaxed mt-1 whitespace-pre-wrap">
            {renderContent(post.content)}
          </p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post"
              className="mt-3 rounded-xl max-h-96 w-full object-cover border border-border"
            />
          )}

          <div className="flex items-center gap-1 mt-3 -ml-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 h-9 px-3 rounded-full ${liked ? "text-red-500" : "text-muted-foreground"} hover:text-red-500 hover:bg-red-500/10`}
              onClick={handleLike}
            >
              <Heart className={`h-[18px] w-[18px] ${liked ? "fill-current" : ""}`} />
              {likesCount > 0 && <span className="text-sm">{likesCount}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-9 px-3 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              {post.comments_count > 0 && <span className="text-sm">{post.comments_count}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/post/" + post.id);
                toast.success("Link copied!");
              }}
            >
              <Share2 className="h-[18px] w-[18px]" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 rounded-full ${bookmarked ? "text-primary" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`}
              onClick={handleBookmark}
            >
              <Bookmark className={`h-[18px] w-[18px] ${bookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
