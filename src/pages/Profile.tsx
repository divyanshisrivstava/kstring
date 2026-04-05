import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/feed/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Edit2, Calendar, BookOpen } from "lucide-react";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("posts")
      .select("*, profiles!posts_user_id_fkey(full_name, avatar_url, branch)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: likesData } = await supabase.from("likes").select("post_id").eq("user_id", user.id);
    const { data: bookmarksData } = await supabase.from("bookmarks").select("post_id").eq("user_id", user.id);

    setPosts(data || []);
    setLikedPosts(new Set((likesData || []).map((l) => l.post_id)));
    setBookmarkedPosts(new Set((bookmarksData || []).map((b) => b.post_id)));
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openEdit = () => {
    setEditName(profile?.full_name || "");
    setEditBio(profile?.bio || "");
    setEditInterests((profile?.interests || []).join(", "));
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
          bio: editBio,
          interests: editInterests.split(",").map((s) => s.trim()).filter(Boolean),
        })
        .eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      setEditOpen(false);
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "User"}</h1>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={openEdit}>
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} maxLength={300} />
                    </div>
                    <div className="space-y-2">
                      <Label>Interests (comma separated)</Label>
                      <Input value={editInterests} onChange={(e) => setEditInterests(e.target.value)} />
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
              <p className="text-muted-foreground mt-1">{profile?.email}</p>
              {profile?.bio && <p className="text-foreground mt-2">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                {profile?.course && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {profile.course}
                  </span>
                )}
                {profile?.branch && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {profile.branch}
                  </span>
                )}
              {profile?.batch_start && profile?.batch_end && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {profile.batch_start}–{profile.batch_end}
                </span>
              )}
            </div>
            {profile?.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.interests.map((interest) => (
                  <span key={interest} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User posts */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Posts</h3>
      </div>
      {posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <p>No posts yet</p>
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

export default Profile;
