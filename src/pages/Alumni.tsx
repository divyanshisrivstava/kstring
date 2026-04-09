import { useEffect, useState } from "react";
import { Github, Instagram, Linkedin, MessageCircle, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type AlumniProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  course: string | null;
  branch: string | null;
  batch_start: number | null;
  batch_end: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
};

const Alumni = () => {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);

  useEffect(() => {
    const fetchAlumni = async () => {
      const { data } = await supabase
        .from("alumni_profiles")
        .select("*")
        .order("batch_end", { ascending: false })
        .limit(100);

      setAlumni((data as AlumniProfile[]) || []);
    };

    void fetchAlumni();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Alumni Directory</h1>
        <p className="text-sm text-muted-foreground">
          A lightweight directory of former KIIT Connect users who chose to remain discoverable after their main
          account was archived.
        </p>
      </div>

      {alumni.length === 0 ? (
        <div className="rounded-xl border border-border p-10 text-center text-muted-foreground">
          No alumni cards yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alumni.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {entry.full_name?.charAt(0)?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{entry.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{entry.course || "KIIT Alumni"}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {entry.branch && (
                    <p className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {entry.branch}
                    </p>
                  )}
                  {entry.batch_start && entry.batch_end && (
                    <p>{entry.batch_start} - {entry.batch_end}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  {entry.github_url && <a href={entry.github_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><Github className="h-4 w-4" />GitHub</a>}
                  {entry.linkedin_url && <a href={entry.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><Linkedin className="h-4 w-4" />LinkedIn</a>}
                  {entry.instagram_url && <a href={entry.instagram_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><Instagram className="h-4 w-4" />Instagram</a>}
                  {entry.whatsapp_url && <a href={entry.whatsapp_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><MessageCircle className="h-4 w-4" />WhatsApp</a>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alumni;
