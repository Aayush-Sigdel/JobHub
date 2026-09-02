import {
  BookOpen,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/service-api";
import type {
  EducationDto,
  ExperienceDto,
  SocialLinkDto,
  UserProfileResponse,
} from "@/types/api/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "U";
}

function formatDate(value?: string) {
  if (!value) return "Present";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform.toUpperCase()) {
    case "GITHUB":
      return <Code2 className="size-4" />;
    case "LINKEDIN":
      return <BriefcaseBusiness className="size-4" />;
    case "ORCID":
    case "DEV_TO":
      return <BookOpen className="size-4" />;
    default:
      return <LinkIcon className="size-4" />;
  }
}

function ExperienceList({ experiences }: { experiences: ExperienceDto[] }) {
  if (experiences.length === 0) return null;

  return (
    <section className="border-t border-border pt-8">
      <div className="mb-6 flex items-center gap-3">
        <BriefcaseBusiness className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Experience</h2>
      </div>
      <div className="space-y-7">
        {experiences.map((experience) => (
          <article key={experience.id} className="relative border-l-2 border-border pl-5">
            <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-primary" />
            <h3 className="font-bold text-foreground">{experience.title}</h3>
            <p className="mt-0.5 text-sm font-medium text-foreground/80">
              {experience.company}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {formatDate(experience.startDate)} –{" "}
              {experience.isCurrentRole ? "Present" : formatDate(experience.endDate)}
            </p>
            {experience.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {experience.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function EducationList({ educations }: { educations: EducationDto[] }) {
  if (educations.length === 0) return null;

  return (
    <section className="border-t border-border pt-8">
      <div className="mb-6 flex items-center gap-3">
        <GraduationCap className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Education</h2>
      </div>
      <div className="space-y-6">
        {educations.map((education) => (
          <article key={education.id}>
            <h3 className="font-bold text-foreground">{education.institution}</h3>
            <p className="mt-1 text-sm text-foreground/80">
              {education.degree} in {education.fieldOfStudy}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {formatDate(education.startDate)} – {formatDate(education.endDate)}
            </p>
            {education.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {education.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function SocialLinks({ links }: { links: SocialLinkDto[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.id}
          href={getExternalUrl(link.url)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
        >
          <SocialIcon platform={link.platform} />
          <span className="capitalize">{link.platform.replaceAll("_", " ").toLowerCase()}</span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
      ))}
    </div>
  );
}

export default async function ProfilePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let profile: UserProfileResponse | null = null;

  try {
    profile = await fetchWithAuth<UserProfileResponse>(`/user/profile/${id}`);
  } catch (error) {
    console.error("Failed to load profile preview", error);
  }

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-16">
        <div className="w-full border-y border-border py-10 text-center">
          <UserRound className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold">Profile preview unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in to view this profile. The backend profile endpoint currently requires authentication.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-border pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar className="size-28 border border-border md:size-32">
              <AvatarImage src={profile.imageUrl} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-2xl font-black text-primary">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                  {profile.name}
                </h1>
                {profile.isVerified && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <ShieldCheck className="size-3.5" /> Verified
                  </Badge>
                )}
              </div>
              {profile.title && (
                <p className="mt-2 text-lg font-medium text-muted-foreground">
                  {profile.title}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" /> {profile.location}
                  </span>
                )}
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                  <Mail className="size-4" /> {profile.email}
                </a>
                {profile.contactNumbers[0] && (
                  <a href={`tel:${profile.contactNumbers[0]}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                    <Phone className="size-4" /> {profile.contactNumbers[0]}
                  </a>
                )}
              </div>
              <div className="mt-5">
                <SocialLinks links={profile.socialLinks} />
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
            {profile.bio && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <UserRound className="size-5 text-primary" />
                  <h2 className="text-lg font-bold">About</h2>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                  {profile.bio}
                </p>
              </section>
            )}
            <ExperienceList experiences={profile.experiences} />
          </div>

          <aside className="space-y-8 border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {profile.skills.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h2 className="font-bold">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="font-medium">
                      {skill.name} · {skill.level.toLowerCase()}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
            <EducationList educations={profile.educations} />
          </aside>
        </div>

        {/* Portfolio, intro video, preferred roles, certifications, and languages remain hidden until API endpoints are available. */}
      </div>
    </main>
  );
}
