'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Share2,
  ExternalLink,
  Check,
  Pencil,
  ShieldCheck,
  Globe,
  Link as LinkIcon,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { UserProfileResponse } from '@/types/api/user';

interface ProfilePreviewViewProps {
  profile: UserProfileResponse;
  isOwner: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'U';
}

function formatDisplayDate(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    return format(parseISO(isoStr), 'MMM yyyy');
  } catch {
    return isoStr;
  }
}

function getExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function PlatformIcon({ platform, className = 'w-4.5 h-4.5' }: { platform: string; className?: string }) {
  switch (platform.toUpperCase()) {
    case 'LINKEDIN':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#0A66C2" aria-label="LinkedIn">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34m1.39 9.74v-8.37H5.07v8.37h2.78z" />
        </svg>
      );
    case 'GITHUB':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="GitHub">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );
    case 'ORCID':
      return (
        <svg viewBox="0 0 256 256" className={className} aria-label="ORCID">
          <path fill="#A6CE39" d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z" />
          <path fill="#FFFFFF" d="M86.3 186.2H70.9V79.1h15.4v107.1zM78.6 66.8c-5.7 0-10.3-4.6-10.3-10.3s4.6-10.3 10.3-10.3 10.3 4.6 10.3 10.3-4.6 10.3-10.3 10.3zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 43.6-25.2 43.6-39.7 0-22.1-14.7-39.7-43.8-39.7h-24.3v79.4z" />
        </svg>
      );
    case 'STACKOVERFLOW':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#F58025" aria-label="Stack Overflow">
          <path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 19.731H16.85v-2.137H6.111v2.137zm.259-4.852l10.48 2.189.451-2.07-10.478-2.187-.453 2.068zm1.359-5.056l9.666 4.623.957-1.916-9.667-4.627-.956 1.92zm3.35-4.87l7.8 7.33 1.455-1.575-7.79-7.33-1.465 1.575zm6.56-4.953l-1.81 1.15 5.733 9.068 1.809-1.15-5.732-9.068z" />
        </svg>
      );
    case 'DEV_TO':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Dev.to">
          <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H5.34v4.36h1.24c.4 0 .68-.08.85-.24.17-.16.25-.41.25-.76v-2.37c0-.35-.08-.6-.26-.76zM0 4.8v14.4C0 20.19.81 21 1.8 21h20.4c.99 0 1.8-.81 1.8-1.8V4.8c0-.99-.81-1.8-1.8-1.8H1.8C.81 3 0 3.81 0 4.8zm3.69 10.97V8.23h2.89c.84 0 1.49.23 1.95.68.46.45.69 1.1.69 1.95v2.28c0 .85-.23 1.5-.69 1.95-.46.45-1.11.68-1.95.68H3.69v-.03zm7.81 0V8.23h4.94v1.65h-3.29v1.62h3.13v1.65h-3.13v1.62h3.29v1.65h-4.94v-.02zm6.39 0l1.83-7.54h1.75l1.83 7.54h-1.72l-.35-1.63h-1.27l-.35 1.63h-1.72zm2.34-3.12h.74l-.37-1.9-.37 1.9z" />
        </svg>
      );
    case 'PORTFOLIO':
      return <Briefcase className={className} />;
    case 'WEBSITE':
      return <Globe className={className} />;
    default:
      return <LinkIcon className={className} />;
  }
}

function formatPlatformLabel(platform: string): string {
  switch (platform.toUpperCase()) {
    case 'LINKEDIN':
      return 'LinkedIn';
    case 'GITHUB':
      return 'GitHub';
    case 'ORCID':
      return 'ORCID';
    case 'STACKOVERFLOW':
      return 'Stack Overflow';
    case 'DEV_TO':
      return 'Dev.to';
    case 'PORTFOLIO':
      return 'Portfolio';
    case 'WEBSITE':
      return 'Website';
    default:
      return platform.replaceAll('_', ' ');
  }
}

export default function ProfilePreviewView({ profile, isOwner }: ProfilePreviewViewProps) {
  const [copied, setCopied] = useState(false);

  const experiences = profile.experiences || [];
  const educations = profile.educations || [];
  const skills = profile.skills || [];
  const socialLinks = profile.socialLinks || [];
  const contactNumbers = profile.contactNumbers || [];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Public profile link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background p-4 sm:p-6 md:p-8 lg:p-12 font-sans text-foreground">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Top Breadcrumb & Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Link
              href={profile.employer ? "/dashboard" : "/find-job"}
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{profile.employer ? "Dashboard" : "Jobs"}</span>
            </Link>
            <span>/</span>
            <span>{profile.employer ? 'Employers' : 'Candidates'}</span>
            <span>/</span>
            <span className="text-foreground font-bold">{profile.name}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl text-xs font-semibold h-9 px-3.5 cursor-pointer shadow-2xs gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-foreground" /> : <Share2 className="w-4 h-4 text-muted-foreground" />}
              <span>{copied ? 'Copied Link!' : 'Share Profile'}</span>
            </Button>

            {isOwner ? (
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5"
              >
                <Link href="/profile">
                  <Pencil className="w-3.5 h-3.5 text-black" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5"
              >
                <a href={`mailto:${profile.email}`}>
                  <Mail className="w-3.5 h-3.5 text-black" />
                  <span>{profile.employer ? 'Contact Employer' : 'Contact Candidate'}</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-2 border-border shadow-xs shrink-0">
                <AvatarImage src={profile.imageUrl} alt={profile.name} className="object-cover rounded-2xl" />
                <AvatarFallback className="bg-primary text-black font-black text-2xl rounded-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {profile.name}
                  </h1>
                  {profile.isVerified && (
                    <div
                      className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                      title={profile.employer ? "Verified Employer" : "Verified Candidate"}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {profile.title && (
                  <p className="text-base sm:text-lg font-medium text-foreground/85">
                    {profile.title}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground pt-1">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-muted-foreground/80 shrink-0" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  {experiences.length > 0 && (
                    <>
                      <span className="text-border">·</span>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                        <span>{experiences.length} {experiences.length === 1 ? 'Role' : 'Roles'}</span>
                      </span>
                    </>
                  )}
                  {skills.length > 0 && (
                    <>
                      <span className="text-border">·</span>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                        <span>{skills.length} Skills</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right Badges */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-muted/60 text-foreground border border-border">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <span>{profile.employer ? 'Employer Profile' : 'Candidate Profile'}</span>
              </span>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary text-black shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                  <span>Verified Professional</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Two-Column Layout matching candidate-profile */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column (flex-1) */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* About Card */}
            {profile.bio && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                    <UserRound className="h-4.5 w-4.5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">About</h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      Professional summary and career background
                    </p>
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/85">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.employer && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                    <Briefcase className="h-4.5 w-4.5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Hiring Organization</h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      Official recruitment profile on JobHub
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This employer actively manages hiring campaigns and evaluates candidate talent on JobHub. Reach out via the verified channels to discuss open roles, candidate inquiries, or recruitment collaborations.
                </p>
              </div>
            )}
                {/* Work Experience Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                      <Briefcase className="h-4.5 w-4.5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Work Experience</h2>
                      <p className="text-xs text-muted-foreground font-medium">
                        Roles, career highlights, and impact
                      </p>
                    </div>
                  </div>
                  {experiences.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
                      {experiences.length} {experiences.length === 1 ? 'Position' : 'Positions'}
                    </span>
                  )}
                </div>

                {experiences.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/10">
                    <p className="text-sm font-semibold text-foreground">No work experience listed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No past work experiences added yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="group relative border-l-2 border-border/80 ml-2.5 pl-5 pb-6 last:pb-1"
                      >
                        {/* Timeline Dot with Brand Green Indicator */}
                        <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-xs" />

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-[17px] font-bold text-foreground leading-snug">
                            {exp.title}
                          </h3>
                          <p className="text-sm font-semibold text-foreground/85 mt-0.5">
                            {exp.company}
                          </p>

                          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                            <span>
                              {formatDisplayDate(exp.startDate) || 'N/A'} -{' '}
                              {exp.isCurrentRole || exp.currentRole
                                ? 'Present'
                                : formatDisplayDate(exp.endDate) || 'N/A'}
                            </span>
                          </div>

                          {exp.description && (
                            <p className="mt-2.5 whitespace-pre-wrap text-sm text-muted-foreground font-normal leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                      <Sparkles className="h-4.5 w-4.5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Skills & Expertise</h2>
                      <p className="text-xs text-muted-foreground font-medium">
                        Technical proficiencies and competencies
                      </p>
                    </div>
                  </div>
                  {skills.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
                      {skills.length} {skills.length === 1 ? 'Skill' : 'Skills'}
                    </span>
                  )}
                </div>

                {skills.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/10">
                    <p className="text-sm font-semibold text-foreground">No skills listed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No technical skills added yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {skills.map((skill) => (
                      <div
                        key={skill.id || skill.name}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-semibold text-sm text-foreground block truncate mr-2">
                          {skill.name}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md border shrink-0 capitalize bg-muted/60 text-muted-foreground border-border/80">
                          {skill.level.toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                      <GraduationCap className="h-4.5 w-4.5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Education</h2>
                      <p className="text-xs text-muted-foreground font-medium">
                        Degrees, institutions, and academic background
                      </p>
                    </div>
                  </div>
                  {educations.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
                      {educations.length} {educations.length === 1 ? 'Degree' : 'Degrees'}
                    </span>
                  )}
                </div>

                {educations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/10">
                    <p className="text-sm font-semibold text-foreground">No education history listed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No academic degrees or credentials added yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {educations.map((edu) => (
                      <div
                        key={edu.id}
                        className="group relative border-l-2 border-border/80 ml-2.5 pl-5 pb-6 last:pb-1"
                      >
                        {/* Timeline Dot with Brand Green Indicator */}
                        <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-xs" />

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-[17px] font-bold text-foreground leading-snug">
                            {edu.institution}
                          </h3>
                          <p className="text-sm font-semibold text-foreground/85 mt-0.5">
                            {edu.degree}
                            {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                          </p>

                          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                            <span>
                              {formatDisplayDate(edu.startDate) || 'N/A'} -{' '}
                              {formatDisplayDate(edu.endDate) || 'Present'}
                            </span>
                          </div>

                          {edu.description && (
                            <p className="mt-2.5 whitespace-pre-wrap text-sm text-muted-foreground font-normal leading-relaxed">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>

          {/* Right Sidebar (w-full lg:w-[320px]) */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
            {/* Contact Information Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              {/* Email */}
              <div>
                <h2 className="text-[15px] font-bold text-foreground mb-3">Email Address</h2>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 text-sm font-medium text-foreground hover:underline p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-9 h-9 bg-card rounded-lg flex items-center justify-center shrink-0 border border-border shadow-2xs">
                    <Mail className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="truncate">{profile.email}</span>
                </a>
              </div>

              {/* Phone Numbers */}
              {contactNumbers.length > 0 && (
                <div className="pt-4 border-t border-border/60">
                  <h2 className="text-[15px] font-bold text-foreground mb-3">Phone Number</h2>
                  <div className="flex flex-col gap-2">
                    {contactNumbers.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone}`}
                        className="flex items-center gap-3 text-sm font-medium text-foreground hover:underline p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="w-9 h-9 bg-card rounded-lg flex items-center justify-center shrink-0 border border-border shadow-2xs">
                          <Phone className="w-4 h-4 text-foreground" />
                        </div>
                        <span className="truncate">{phone}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links with actual brand logos */}
              {socialLinks.length > 0 && (
                <div className="pt-4 border-t border-border/60">
                  <h2 className="text-[15px] font-bold text-foreground mb-3">Social & Links</h2>
                  <div className="flex flex-col gap-2.5">
                    {socialLinks.map((link, idx) => (
                      <a
                        key={link.id || idx}
                        href={getExternalUrl(link.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-sm font-medium text-foreground group p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="w-9 h-9 bg-card rounded-lg flex items-center justify-center shrink-0 border border-border shadow-2xs">
                          <PlatformIcon platform={link.platform} className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block leading-none">
                            {formatPlatformLabel(link.platform)}
                          </span>
                          <span className="text-xs font-semibold text-foreground/90 truncate block mt-0.5 group-hover:underline">
                            {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Overview Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
              <h2 className="text-[15px] font-bold text-foreground">
                {profile.employer ? 'Recruiter Overview' : 'Candidate Overview'}
              </h2>

              <div className="divide-y divide-border/60 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium">Verification</span>
                  <span
                    className={`font-bold inline-flex items-center gap-1 ${
                      profile.isVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                    }`}
                  >
                    {profile.isVerified ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>{profile.employer ? 'Verified Employer' : 'Verified Talent'}</span>
                      </>
                    ) : (
                      'Standard Profile'
                    )}
                  </span>
                </div>

                {profile.employer ? (
                  <>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-muted-foreground font-medium">Account Role</span>
                      <span className="font-bold text-foreground">Employer / Recruiter</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-muted-foreground font-medium">Location</span>
                        <span className="font-bold text-foreground">{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-muted-foreground font-medium">Verified Status</span>
                      <span className="font-bold text-foreground">
                        {profile.isVerified ? "Verified Employer" : "Standard Employer"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-muted-foreground font-medium">Channels</span>
                      <span className="font-bold text-foreground">
                        {socialLinks.length} {socialLinks.length === 1 ? 'Link' : 'Links'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-muted-foreground font-medium">Work History</span>
                      <span className="font-bold text-foreground">
                        {experiences.length} {experiences.length === 1 ? 'Position' : 'Positions'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-muted-foreground font-medium">Skills Listed</span>
                      <span className="font-bold text-foreground">
                        {skills.length} {skills.length === 1 ? 'Skill' : 'Skills'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-muted-foreground font-medium">Education</span>
                      <span className="font-bold text-foreground">
                        {educations.length} {educations.length === 1 ? 'Credential' : 'Credentials'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {!isOwner && (
                  <Button
                    asChild
                    className="w-full h-10 rounded-xl font-bold text-xs bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-2"
                  >
                    <a href={`mailto:${profile.email}`}>
                      <Mail className="w-4 h-4 text-black" />
                      <span>{profile.employer ? 'Email Recruiter' : 'Email Candidate'}</span>
                    </a>
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleShare}
                  className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{copied ? 'Link Copied!' : 'Copy Profile Link'}</span>
                </Button>

                {isOwner && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer gap-2"
                  >
                    <Link href="/profile">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Edit Your Profile</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
