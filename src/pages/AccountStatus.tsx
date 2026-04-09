import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, AlertTriangle, Clock3 } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountStatus = () => {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const lifecycleStatus = profile?.lifecycle_status ?? "active";

  const handleGoogleRevalidation = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        hd: "kiit.ac.in",
        prompt: "select_account",
        ...(user?.email ? { login_hint: user.email } : {}),
      },
    });

    if (result && "error" in result && result.error) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {lifecycleStatus === "restricted" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : lifecycleStatus === "scheduled_for_deletion" ? (
                <Clock3 className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>
            <CardTitle>Account status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {lifecycleStatus === "revalidation_required" && (
              <p>
                Your account is still active, but we need you to revalidate with your KIIT Google account because your
                normal course tenure has ended.
              </p>
            )}

            {lifecycleStatus === "restricted" && (
              <p>
                Access is temporarily restricted until you revalidate with your KIIT Google account. We are no longer
                deleting accounts only because the batch end year passed.
              </p>
            )}

            {lifecycleStatus === "scheduled_for_deletion" && (
              <p>
                Your account is scheduled for deletion. If KIIT email delivery permanently failed, deletion is
                fast-tracked. Otherwise, you still have a short recovery window to restore the account by signing in
                again with your KIIT Google account.
              </p>
            )}

            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
              <p>
                KIIT email: <span className="font-medium text-foreground">{user?.email}</span>
              </p>
              {profile?.last_revalidated_at && (
                <p>
                  Last revalidated{" "}
                  <span className="font-medium text-foreground">
                    {formatDistanceToNow(new Date(profile.last_revalidated_at), { addSuffix: true })}
                  </span>
                </p>
              )}
              {profile?.expected_completion_year && (
                <p>
                  Normal completion year{" "}
                  <span className="font-medium text-foreground">{profile.expected_completion_year}</span>
                </p>
              )}
              {profile?.extended_until && (
                <p>
                  Extended access active until{" "}
                  <span className="font-medium text-foreground">
                    {formatDistanceToNow(new Date(profile.extended_until), { addSuffix: true })}
                  </span>
                </p>
              )}
              {profile?.revalidation_grace_until && (
                <p>
                  Grace period ends{" "}
                  <span className="font-medium text-foreground">
                    {formatDistanceToNow(new Date(profile.revalidation_grace_until), { addSuffix: true })}
                  </span>
                </p>
              )}
              {profile?.email_bounce_status && profile.email_bounce_status !== "none" && (
                <p>
                  Email delivery status:{" "}
                  <span className="font-medium text-foreground capitalize">{profile.email_bounce_status} bounce</span>
                </p>
              )}
              {profile?.permanently_delete_after && (
                <p>
                  Permanent deletion scheduled{" "}
                  <span className="font-medium text-foreground">
                    {formatDistanceToNow(new Date(profile.permanently_delete_after), { addSuffix: true })}
                  </span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleGoogleRevalidation} disabled={loading} className="sm:flex-1">
                {loading ? "Redirecting..." : "Revalidate with KIIT Google"}
              </Button>
              <Button variant="outline" onClick={() => void signOut()} className="sm:flex-1">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountStatus;
