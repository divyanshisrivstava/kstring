import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";

const Explore = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data } = await supabase
        .from("posts")
        .select("hashtags")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        const tagCount: Record<string, number> = {};
        data.forEach((p) => p.hashtags?.forEach((t: string) => {
          tagCount[t] = (tagCount[t] || 0) + 1;
        }));
        const sorted = Object.entries(tagCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag);
        setTrendingTags(sorted);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) { setUsers([]); return; }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${query}%,branch.ilike.%${query}%`)
        .limit(20);
      setUsers(data || []);
    };
    const timeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search people, branches..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl bg-muted border-0"
        />
      </div>

      {trendingTags.length > 0 && !query && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">People</h3>
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
              <Avatar className="h-11 w-11">
                <AvatarImage src={u.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{u.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {u.branch} · {u.batch_start}–{u.batch_end}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && users.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No results found</p>
      )}
    </div>
  );
};

export default Explore;
