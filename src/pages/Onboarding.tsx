import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GraduationCap, ArrowRight } from "lucide-react";
import { getCourseByValue, KIIT_COURSES } from "@/lib/kiit-academics";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - 4 + i);

const Onboarding = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [batchStart, setBatchStart] = useState("");
  const [batchEnd, setBatchEnd] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectedCourse = getCourseByValue(course);
  const courseBranches = selectedCourse?.branches ?? [];
  const requiresBranch = courseBranches.length > 0;

  const removeUnknownColumnFromPayload = (
    payload: Record<string, unknown>,
    message?: string,
  ) => {
    const match = message?.match(/Could not find the '([^']+)' column/);
    if (!match) return null;

    const nextPayload = { ...payload };
    delete nextPayload[match[1]];
    return nextPayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !privacyAccepted) {
      toast.error("Please accept both the Terms & Conditions and Privacy Policy");
      return;
    }
    if (!course || !batchStart || !batchEnd || (requiresBranch && !branch)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const batchEndNum = parseInt(batchEnd);
      const expiresAt = new Date(batchEndNum, 11, 31).toISOString();

      const payload = {
        course: selectedCourse?.label ?? course,
        branch: requiresBranch ? branch : "",
        batch_start: parseInt(batchStart),
        batch_end: batchEndNum,
        bio,
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        terms_accepted: true,
        privacy_accepted: true,
        onboarding_completed: true,
        account_expires_at: expiresAt,
      };

      let activePayload: Record<string, unknown> = payload;
      let { error } = await supabase.from("profiles").update(activePayload).eq("user_id", user!.id);

      while (error?.message?.includes("Could not find the")) {
        const nextPayload = removeUnknownColumnFromPayload(activePayload, error.message);
        if (!nextPayload) break;
        activePayload = nextPayload;
        ({ error } = await supabase.from("profiles").update(activePayload).eq("user_id", user!.id));
      }

      if (error) throw error;
      await refreshProfile();
      toast.success("Profile setup complete!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-8 animate-in-up">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground">Tell us about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Course *</Label>
            <Select
              value={course}
              onValueChange={(value) => {
                setCourse(value);
                setBranch("");
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your course" />
              </SelectTrigger>
              <SelectContent>
                {KIIT_COURSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresBranch && (
            <div className="space-y-2">
              <Label>Branch / Specialization *</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your branch or specialization" />
                </SelectTrigger>
                <SelectContent>
                  {courseBranches.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {course && !requiresBranch && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              This course does not need a separate branch selection.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Start Year *</Label>
              <Select value={batchStart} onValueChange={setBatchStart}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Start year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Batch End Year *</Label>
              <Select value={batchEnd} onValueChange={setBatchEnd}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="End year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              placeholder="A short bio about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[80px]"
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label>Interests / Skills</Label>
            <Input
              placeholder="e.g. coding, design, music (comma separated)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I accept the{" "}
                <Link to="/terms" className="font-medium text-primary hover:underline">
                  Terms & Conditions
                </Link>
                .
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I accept the{" "}
                <Link to="/privacy" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
                {" "}and understand my account will expire at the end of my graduation year.
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base gap-2" disabled={loading}>
            {loading ? "Setting up..." : "Complete Setup"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
