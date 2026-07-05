import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CompanyCardProps {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  location: string;
  employees: string;
  openJobs: number;
}

export function CompanyCard({
  id,
  name,
  description,
  logoUrl,
  coverUrl,
  location,
  employees,
  openJobs,
}: CompanyCardProps) {
  return (
    <Card className="overflow-hidden border-border bg-card transition-all hover:shadow-md hover:border-border/80 group">
      <div className="relative h-32 md:h-40 w-full overflow-hidden">
        {/* Cover Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
          style={{ backgroundImage: `url(${coverUrl})` }} 
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        
        {/* Logo overlapping */}
        <div className="absolute -bottom-6 left-4">
          <Avatar className="h-16 w-16 border-4 border-card bg-card shadow-sm">
            <AvatarImage src={logoUrl} alt={name} className="object-cover" />
            <AvatarFallback className="font-bold text-lg">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-10 pb-5 px-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-xl text-foreground line-clamp-1">{name}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 font-medium">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {location}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {employees}</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-foreground/80 mt-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            {openJobs} Open Roles
          </span>
          <Button variant="ghost" className="text-sm font-semibold hover:bg-transparent hover:text-primary p-0 h-auto group/btn">
            Explore <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
