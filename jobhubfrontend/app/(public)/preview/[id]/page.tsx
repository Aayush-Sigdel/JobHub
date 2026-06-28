import {
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  FolderKanban,
  Mail,
  Code,
  Link as LinkIcon,
  Search,
  Phone,
  Video,
  User,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default async function ProfilePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  // Mock Data
  const profile = {
    name: "Aayush Sigdel",
    username: resolvedParams.id,
    isVerified: true,
    title: "Full Stack Engineer",
    email: ["aayush@example.com"],
    contactNumber: ["+1 (555) 123-4567"],
    location: "San Francisco, CA",
    languages: ["English (Native)", "Spanish (Conversational)"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    socialLinks: [
      { platform: "LinkedIn", url: "https://linkedin.com" },
      { platform: "GitHub", url: "https://github.com" },
      { platform: "ORCID", url: "https://orcid.org" },
    ],
    lookingForRole: [
      {
        id: "1",
        name: "Full Stack Engineer",
        roleLevel: "Senior-level",
        workType: "Remote",
      },
      {
        id: "2",
        name: "Frontend Developer",
        roleLevel: "Mid-level",
        workType: "Hybrid",
      },
    ],
    about:
      "I am a passionate software engineer building scalable web applications. I love working with React, Next.js, and Node.js. My goal is to create products that provide meaningful experiences for users while maintaining robust and efficient codebases.",
    projects: [
      {
        id: "p1",
        title: "E-Commerce Dashboard",
        description:
          "A complete dashboard for managing online stores with real-time analytics. Built from scratch to handle thousands of concurrent transactions.",
        technologies: ["React", "Next.js", "Tailwind CSS"],
        link: "https://example.com",
      },
      {
        id: "p2",
        title: "Social Media App",
        description:
          "A realtime chat and feed app utilizing WebSockets and Firebase.",
        technologies: ["React Native", "Firebase"],
        link: "https://example.com",
      },
    ],
    experiences: [
      {
        id: "e1",
        title: "Senior Frontend Engineer",
        company: "Tech Corp",
        employmentType: "Full-time",
        startDate: "2023-01",
        endDate: "Present",
        isCurrent: true,
        description:
          "Led the frontend team in migrating from Vue to React. Built core design system used by 5+ internal products.",
      },
    ],
    education: [
      {
        id: "ed1",
        school: "Pokhara University",
        degree: "B.A. Degree",
        fieldOfStudy: "Computer Science",
        startDate: "2023",
        endDate: "2027",
      },
    ],
    certifications: [
      {
        id: "c1",
        name: "AWS Certified Developer",
        provider: "Amazon",
        issueDate: "2025",
      },
    ],
    skills: [
      { name: "React", level: "Expert" },
      { name: "Next.js", level: "Expert" },
      { name: "Node.js", level: "Intermediate" },
      { name: "TypeScript", level: "Expert" },
      { name: "Tailwind CSS", level: "Expert" },
    ],
  };
  console.log("Profile Data:", profile);
  return (
    <div className="min-h-screen bg-background font-sans pb-20 pt-10">
      <main className="max-w-[1100px] mx-auto px-4 md:px-8">
        {/* Top Header Card */}
        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 dark:border-border flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted flex items-center justify-center text-4xl overflow-hidden shrink-0 border-4 border-white shadow-md">
            <img
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${profile.username}&backgroundColor=e2e8f0`}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 pt-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
              {profile.name}
              {profile.isVerified && (
                <div
                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0"
                  title="Verified Professional"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </h1>
            <p className="text-muted-foreground font-medium text-lg md:text-xl mt-1.5">
              {profile.title}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 mt-5 text-[15px] font-medium text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />{" "}
                  {profile.location}
                </div>
              )}
              {profile.email && profile.email.length > 0 && (
                <a
                  href={`mailto:${profile.email[0]}`}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-4 h-4 text-muted-foreground" /> {profile.email[0]}
                </a>
              )}
              {profile.contactNumber && profile.contactNumber.length > 0 && (
                <a
                  href={`tel:${profile.contactNumber[0]}`}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <Phone className="w-4 h-4 text-muted-foreground" />{" "}
                  {profile.contactNumber[0]}
                </a>
              )}
            </div>

            {/* Social Links */}
            {profile.socialLinks && profile.socialLinks.length > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                {profile.socialLinks.map((link) => {
                  const platform = link.platform.toLowerCase();
                  return (
                    <a
                      key={platform}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 bg-muted rounded-full flex items-center justify-center border border-border hover:bg-gray-900 hover:text-white hover:border-gray-900 text-muted-foreground transition-all shadow-sm"
                      title={link.platform}
                    >
                      {platform === "github" ? (
                        <Code className="w-5 h-5" />
                      ) : platform === "linkedin" ? (
                        <Briefcase className="w-5 h-5" />
                      ) : platform === "orcid" ? (
                        <BookOpen className="w-5 h-5" />
                      ) : (
                        <LinkIcon className="w-5 h-5" />
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content (Left Column) */}
          <div className="flex-1 flex flex-col gap-8">
            {/* About */}
            {profile.about && (
              <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground">About</h2>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {profile.about}
                </p>
              </div>
            )}

            {/* Experience */}
            {profile.experiences && profile.experiences.length > 0 && (
              <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground">
                    Experience
                  </h2>
                </div>
                <div className="flex flex-col gap-8">
                  {profile.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="relative pl-6 border-l-2 border-border/50 dark:border-border"
                    >
                      <div className="absolute w-3 h-3 bg-card border-2 border-orange-500 rounded-full -left-[7px] top-1"></div>
                      <h3 className="font-bold text-foreground text-[17px]">
                        {exp.title}
                      </h3>
                      <div className="text-[15px] text-foreground/90 font-medium mt-1">
                        {exp.company}
                      </div>
                      <div className="text-[13px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                        {exp.startDate} -{" "}
                        {exp.isCurrent ? "Present" : exp.endDate}
                      </div>
                      {exp.description && (
                        <p className="text-muted-foreground mt-3 text-[14px] leading-relaxed whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {profile.projects && profile.projects.length > 0 && (
              <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground">
                    Portfolio
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {profile.projects.map((project) => (
                    <a
                      key={project.id}
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group block bg-muted hover:bg-muted rounded-2xl p-5 border border-border/50 dark:border-border transition-colors"
                    >
                      <h3 className="font-bold text-foreground text-[16px] group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-[14px] mt-2 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.technologies?.map((tech) => (
                          <span
                            key={tech}
                            className="text-[12px] font-semibold bg-card border border-border text-muted-foreground px-2 py-1 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Intro Video */}
            {profile.videoUrl && (
              <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground">
                    Video Introduction
                  </h2>
                </div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/5 border border-border">
                  <iframe
                    className="w-full h-full"
                    src={profile.videoUrl}
                    title="Intro Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Content (Right Column) */}
          <div className="w-full lg:w-[340px] flex flex-col gap-8 shrink-0">
            {/* Open To Roles */}
            {profile.lookingForRole && profile.lookingForRole.length > 0 && (
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-2.5 mb-5">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-[17px] font-bold text-foreground">
                    Open To Roles
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {profile.lookingForRole.map((role) => (
                    <div
                      key={role.id}
                      className="bg-muted border border-border/50 dark:border-border p-4 rounded-2xl"
                    >
                      <div className="font-bold text-foreground text-[15px]">
                        {role.name}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[12px] font-bold bg-card border border-border text-muted-foreground px-2 py-1 rounded-md shadow-sm">
                          {role.roleLevel}
                        </span>
                        <span className="text-[12px] font-bold bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-md shadow-sm">
                          {role.workType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-2.5 mb-5">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-[17px] font-bold text-foreground">
                    Top Skills
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-xl shadow-sm"
                    >
                      <span className="font-bold text-foreground/90 text-[13px]">
                        {skill.name}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-2.5 mb-5">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <h2 className="text-[17px] font-bold text-foreground">
                    Education
                  </h2>
                </div>
                <div className="flex flex-col gap-5">
                  {profile.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-bold text-foreground text-[15px]">
                        {edu.school}
                      </h3>
                      <p className="text-foreground/80 text-[14px] mt-1">
                        {edu.degree}, {edu.fieldOfStudy}
                      </p>
                      <p className="text-muted-foreground text-[13px] font-medium mt-1">
                        {edu.startDate} - {edu.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-2.5 mb-5">
                  <Award className="w-5 h-5 text-blue-500" />
                  <h2 className="text-[17px] font-bold text-foreground">
                    Certifications
                  </h2>
                </div>
                <div className="flex flex-col gap-5">
                  {profile.certifications.map((cert) => (
                    <div key={cert.id}>
                      <h3 className="font-bold text-foreground text-[15px]">
                        {cert.name}
                      </h3>
                      <p className="text-muted-foreground text-[14px] mt-1">
                        {cert.provider}
                      </p>
                      <p className="text-muted-foreground text-[12px] font-medium mt-1 uppercase tracking-wider">
                        Issued {cert.issueDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 dark:border-border">
                <div className="flex items-center gap-2.5 mb-5">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-[17px] font-bold text-foreground">
                    Languages
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {profile.languages.map((lang) => (
                    <div key={lang} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-[14px] font-semibold text-foreground/90">
                        {lang}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
