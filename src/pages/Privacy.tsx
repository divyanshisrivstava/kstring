const Privacy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground">
          This policy explains what profile and activity data KIIT Connect stores and how it is used inside the campus
          network.
        </p>
      </div>

      <section className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>
          We store your basic profile information such as name, KIIT email, branch, batch, interests, and profile
          activity needed to operate the platform.
        </p>
        <p>
          Platform data like posts, comments, likes, bookmarks, and notifications is processed to provide core social
          features and maintain safety within the community.
        </p>
        <p>
          Student accounts are subject to lifecycle rules tied to graduation year and may be deleted after expiry and
          applicable grace periods according to future retention workflows.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
