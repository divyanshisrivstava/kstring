import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LifecycleBanner() {
  const { profile } = useAuth();
  const lifecycleStatus = profile?.lifecycle_status ?? "active";

  if (!profile || lifecycleStatus !== "revalidation_required") {
    return null;
  }

  return (
    <div className="border-b border-border px-4 py-3">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>KIIT revalidation needed</AlertTitle>
        <AlertDescription>
          Your normal course tenure window has ended, but your account is still active for now. Open{" "}
          <Link to="/account-status" className="font-medium text-primary hover:underline">
            account status
          </Link>{" "}
          to revalidate with your KIIT Google account before the grace period ends.
        </AlertDescription>
      </Alert>
    </div>
  );
}
