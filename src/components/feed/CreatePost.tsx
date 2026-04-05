import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Send } from "lucide-react";
import { toast } from "sonner";

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g);
    return matches ? matches.map((t) => t.toLowerCase()) : [];
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      const hashtags = extractHashtags(content);
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        hashtags,
      });
      if (error) throw error;
      setContent("");
      onPostCreated();
      toast.success("Post published!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-border">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What's happening at KIIT?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] border-0 bg-transparent resize-none text-base focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-primary h-9 w-9">
                <Image className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className="text-xs text-muted-foreground">{content.length}/500</span>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || loading}
                size="sm"
                className="gap-2 rounded-full px-5"
              >
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
