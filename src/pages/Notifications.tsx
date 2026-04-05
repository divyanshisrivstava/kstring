import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications(data || []);

      // mark all as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
    };
    fetch();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
      </div>
      {notifications.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">You'll see activity here when people interact with your posts</p>
        </div>
      ) : (
        notifications.map((n) => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 border-b border-border transition-colors ${
                !n.read ? "bg-primary/5" : "hover:bg-muted/30"
              }`}
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  Someone {n.type === "like" ? "liked" : n.type === "comment" ? "commented on" : "followed"} your{" "}
                  {n.type === "follow" ? "profile" : "post"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Notifications;
