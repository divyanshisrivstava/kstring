import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  bio: string;
  course: string;
  branch: string;
  admission_year: number | null;
  course_duration_years: number | null;
  expected_completion_year: number | null;
  batch_start: number | null;
  batch_end: number | null;
  avatar_url: string;
  interests: string[];
  terms_accepted: boolean;
  privacy_accepted: boolean;
  onboarding_completed: boolean;
  lifecycle_status: "active" | "revalidation_required" | "restricted" | "scheduled_for_deletion";
  last_revalidated_at: string;
  revalidation_grace_until: string | null;
  restricted_at: string | null;
  deletion_scheduled_at: string | null;
  permanently_delete_after: string | null;
  extended_until: string | null;
  revalidation_count: number;
  revalidation_method: string | null;
  email_bounce_status: "none" | "soft" | "hard";
  last_email_sent_at: string | null;
  last_email_bounce_at: string | null;
  alumni_opt_in: boolean;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, authUser?: User | null) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const typedProfile = data as Profile | null;

    if (
      typedProfile &&
      authUser?.app_metadata?.provider === "google" &&
      typedProfile.lifecycle_status !== "active"
    ) {
      const { data: revalidatedProfile } = await supabase.rpc("mark_profile_revalidated", {
        target_user_id: userId,
        method: "google",
      });

      setProfile((revalidatedProfile as Profile | null) ?? typedProfile);
      return;
    }

    setProfile(typedProfile);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id, session.user), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
