import { MessageCircle } from "lucide-react";

const Messages = () => {
  return (
    <div className="max-w-2xl mx-auto p-12 text-center text-muted-foreground">
      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-bold text-foreground mb-2">Messages</h2>
      <p className="text-sm">Direct messaging is coming soon. Stay tuned!</p>
    </div>
  );
};

export default Messages;
