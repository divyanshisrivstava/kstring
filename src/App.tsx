import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Feed from "@/pages/Feed";
import Explore from "@/pages/Explore";
import Notifications from "@/pages/Notifications";
import Messages from "@/pages/Messages";
import Bookmarks from "@/pages/Bookmarks";
import Profile from "@/pages/Profile";
import Alumni from "@/pages/Alumni";
import NotFound from "@/pages/NotFound";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import AccountStatus from "@/pages/AccountStatus";
import { getInvalidDomainMessage, isKiitEmail } from "@/lib/auth";
import { toast } from "sonner";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  requireOnboarding = true,
  allowRestricted = false,
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  allowRestricted?: boolean;
}) => {
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && user && !isKiitEmail(user.email)) {
      toast.error(getInvalidDomainMessage());
      void signOut();
    }
  }, [loading, signOut, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isKiitEmail(user.email)) return <Navigate to="/auth?reason=invalid-domain" replace />;
  if (!profile) return null;
  const lifecycleStatus = profile.lifecycle_status ?? "active";

  const hasAcceptedTerms = Boolean(profile.terms_accepted);
  const hasAcceptedPrivacy =
    profile.privacy_accepted === undefined || profile.privacy_accepted === null
      ? hasAcceptedTerms
      : Boolean(profile.privacy_accepted);

  if (!hasAcceptedTerms || !hasAcceptedPrivacy || !profile.onboarding_completed) {
    if (requireOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
  } else if (!requireOnboarding) {
    return <Navigate to="/" replace />;
  }

  if (!allowRestricted && (lifecycleStatus === "restricted" || lifecycleStatus === "scheduled_for_deletion")) {
    return <Navigate to="/account-status" replace />;
  }

  if (
    allowRestricted &&
    lifecycleStatus !== "restricted" &&
    lifecycleStatus !== "scheduled_for_deletion" &&
    lifecycleStatus !== "revalidation_required"
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/account-status"
              element={
                <ProtectedRoute allowRestricted>
                  <AccountStatus />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/alumni" element={<Alumni />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
