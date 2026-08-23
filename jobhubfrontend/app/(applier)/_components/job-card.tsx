import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, MapPin, DollarSign, Clock, Building, Zap } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  logoUrl?: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  tags: string[];
  featured?: boolean;
  appliedCount?: number;
}

export function JobCard({
  id,
  title,
  company,
  logoUrl,
  location,
  salary,
  type,
  postedAt,
  tags,
  featured = false,
  appliedCount = 18,
}: JobCardProps) {
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${featured ? 'border-primary/50 shadow-primary/10' : 'border-border/50'}`}>
      {featured && (
        <div className="absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground flex items-center gap-1 shadow-sm z-10">
          <Zap className="h-3 w-3 fill-current" />
          Featured
        </div>
      )}
      
      <CardHeader className="p-5 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-border/50 bg-white p-1.5 shadow-sm">
              <Avatar className="h-12 w-12 rounded-lg">
                <AvatarImage src={logoUrl} alt={company} className="object-cover" />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-lg">
                  {company.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mt-1">
                <Building className="h-3.5 w-3.5" />
                <span className="truncate">{company}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0 -mt-1 -mr-1">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <MapPin className="h-3.5 w-3.5 opacity-70" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <DollarSign className="h-3.5 w-3.5 opacity-70" />
            <span className="truncate">{salary}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <BriefcaseIcon className="h-3.5 w-3.5 opacity-70" />
            <span className="truncate">{type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span className="truncate">{postedAt}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          {appliedCount} applied
        </span>
        <Button asChild size="sm" className="font-bold">
          <Link href={`/find-job/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Temporary icon component since Briefcase isn't imported above due to my mistake.
const BriefcaseIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
