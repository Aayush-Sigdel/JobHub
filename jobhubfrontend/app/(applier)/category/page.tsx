import Link from "next/link";
import { 
  Code2, 
  Database, 
  PenTool, 
  Target, 
  Megaphone, 
  DollarSign, 
  Headphones, 
  Users,
  ChevronRight,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

const JOB_CATEGORIES = [
  {
    title: "Software Engineering",
    slug: "software-engineering",
    icon: Code2,
    jobCount: 1240,
    description: "Backend, Frontend, Full Stack, DevOps, and more.",
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  {
    title: "Data & Analytics",
    slug: "data-analytics",
    icon: Database,
    jobCount: 432,
    description: "Data Science, Machine Learning, Data Engineering.",
    color: "bg-purple-50 text-purple-600 border-purple-200"
  },
  {
    title: "Design & UX",
    slug: "design-ux",
    icon: PenTool,
    jobCount: 315,
    description: "UI/UX, Product Design, Graphic Design.",
    color: "bg-pink-50 text-pink-600 border-pink-200"
  },
  {
    title: "Product Management",
    slug: "product-management",
    icon: Target,
    jobCount: 284,
    description: "Product Manager, Owner, Strategy.",
    color: "bg-orange-50 text-orange-600 border-orange-200"
  },
  {
    title: "Marketing & PR",
    slug: "marketing-pr",
    icon: Megaphone,
    jobCount: 390,
    description: "Growth, Content, SEO, Brand Marketing.",
    color: "bg-green-50 text-green-600 border-green-200"
  },
  {
    title: "Sales & Business",
    slug: "sales-business",
    icon: DollarSign,
    jobCount: 512,
    description: "Account Executives, BDR, Sales Managers.",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200"
  },
  {
    title: "Customer Support",
    slug: "customer-support",
    icon: Headphones,
    jobCount: 220,
    description: "Support Specialist, Success Manager.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200"
  },
  {
    title: "HR & Recruiting",
    slug: "hr-recruiting",
    icon: Users,
    jobCount: 185,
    description: "Recruiter, HR Manager, Talent Acquisition.",
    color: "bg-red-50 text-red-600 border-red-200"
  }
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-foreground pb-20 pt-12">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#eaf5fc] text-[#4a73e8] px-4 py-1.5 rounded-full font-bold text-sm mb-6 border border-[#4a73e8]/20 shadow-sm">
            <Search className="h-4 w-4" />
            Explore opportunities
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight leading-tight">
            Find the perfect role by <span className="text-[#4a73e8]">category</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-8 leading-relaxed max-w-2xl mx-auto">
            Browse thousands of job openings across different industries and specialties. 
            Discover your next career move today.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {JOB_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link 
                key={category.slug} 
                href={`/category/${category.slug}`}
                className="group flex flex-col bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${category.color} border shadow-sm`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="bg-muted px-2.5 py-1 rounded-md text-[12px] font-bold text-muted-foreground">
                    {category.jobCount} jobs
                  </div>
                </div>
                
                <h3 className="font-bold text-[18px] text-foreground mb-2 group-hover:text-[#4a73e8] transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-sm font-medium text-muted-foreground line-clamp-2 flex-grow mb-6">
                  {category.description}
                </p>

                <div className="flex items-center text-[#4a73e8] font-bold text-sm mt-auto pt-4 border-t border-border/50">
                  Explore roles
                  <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Call to Action */}
        <div className="mt-20 bg-foreground text-background rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4a73e8]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="max-w-xl relative z-10">
            <h2 className="text-3xl font-black mb-4 tracking-tight">Can't find what you're looking for?</h2>
            <p className="text-muted text-lg font-medium opacity-90">
              Set up a personalized job alert and we'll notify you when roles matching your exact criteria become available.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Button size="lg" className="bg-[#f5a623] hover:bg-[#e0961c] text-foreground font-black text-lg px-8 h-14 rounded-xl shadow-lg border-0 transition-transform hover:scale-105">
              Create Job Alert
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
