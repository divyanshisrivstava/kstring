const Terms = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Terms & Conditions</h1>
        <p className="text-muted-foreground">
          These terms govern access to KIIT Connect, an internal platform intended only for KIIT students.
        </p>
      </div>

      <section className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>
          Access is limited to users with a valid <span className="font-medium text-foreground">@kiit.ac.in</span>{" "}
          email address. You are responsible for maintaining accurate profile details including your branch and batch.
        </p>
        <p>
          You must use the platform respectfully. Harassment, impersonation, spam, academic misuse, and sharing harmful
          or unlawful content are not allowed.
        </p>
        <p>
          KIIT Connect accounts expire based on the graduation year you provide. Access may be suspended or removed when
          your account becomes ineligible or if you violate platform rules.
        </p>
      </section>
    </div>
  );
};

export default Terms;
