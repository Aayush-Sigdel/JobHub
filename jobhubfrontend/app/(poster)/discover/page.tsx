import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, Heart, ChevronRight, Filter } from "lucide-react";

export default function DiscoverTalentPage() {
  const categories = [
    "Graphics & Design",
    "Programming & Tech",
    "Digital Marketing",
    "Video & Animation",
    "Writing & Translation",
    "Music & Audio",
    "Business",
    "Data",
  ];

  const talents = [
    {
      id: 1,
      name: "Alex Dev",
      level: "Top Rated",
      title: "I will build a full-stack Next.js web application",
      rating: 5.0,
      reviews: 142,
      price: "$45/hr",
      image: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
      avatar: "AD",
    },
    {
      id: 2,
      name: "Sarah UI",
      level: "Level 2 Talent",
      title: "I will design an outstanding mobile app UI UX",
      rating: 4.9,
      reviews: 89,
      price: "$60/hr",
      image: "bg-gradient-to-br from-cyan-400 to-blue-600",
      avatar: "SU",
    },
    {
      id: 3,
      name: "Mike DB",
      level: "Top Rated",
      title: "I will optimize your database and backend API",
      rating: 5.0,
      reviews: 312,
      price: "$80/hr",
      image: "bg-gradient-to-br from-emerald-400 to-teal-600",
      avatar: "MD",
    },
    {
      id: 4,
      name: "Emma Copy",
      level: "Level 1 Talent",
      title: "I will write SEO optimized tech blog posts",
      rating: 4.8,
      reviews: 45,
      price: "$30/hr",
      image: "bg-gradient-to-br from-amber-400 to-orange-600",
      avatar: "EC",
    },
    {
      id: 5,
      name: "Chris Cloud",
      level: "Top Rated",
      title: "I will setup your AWS cloud infrastructure",
      rating: 5.0,
      reviews: 218,
      price: "$100/hr",
      image: "bg-gradient-to-br from-slate-700 to-slate-900",
      avatar: "CC",
    },
    {
      id: 6,
      name: "Nina Brand",
      level: "Level 2 Talent",
      title: "I will create a timeless logo and brand identity",
      rating: 4.9,
      reviews: 156,
      price: "$50/hr",
      image: "bg-gradient-to-br from-rose-400 to-red-600",
      avatar: "NB",
    },
    {
      id: 7,
      name: "Leo Motion",
      level: "Pro Talent",
      title: "I will create a stunning 3D product animation",
      rating: 5.0,
      reviews: 82,
      price: "$120/hr",
      image: "bg-gradient-to-br from-fuchsia-500 to-purple-700",
      avatar: "LM",
    },
    {
      id: 8,
      name: "Sam Script",
      level: "Level 2 Talent",
      title: "I will automate your workflow with Python scripts",
      rating: 4.8,
      reviews: 67,
      price: "$40/hr",
      image: "bg-gradient-to-br from-lime-400 to-green-600",
      avatar: "SS",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background -m-6">
      {/* Category Nav - Fiverr Style */}
      <div className="border-b hidden md:block">
        <div className="flex items-center gap-6 px-8 py-3 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
          {categories.map((cat) => (
            <button key={cat} className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        
        {/* Fiverr Style Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-card border shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/90 to-brand/40 z-0"></div>
          <div className="relative z-10 px-8 py-16 md:py-24 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Find the perfect <i className="font-serif font-light">talent</i> for your business
            </h1>
            <div className="flex items-center w-full max-w-xl bg-background rounded-md overflow-hidden p-1 shadow-lg">
              <div className="pl-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input 
                className="border-0 focus-visible:ring-0 shadow-none text-base h-12" 
                placeholder="Try 'Next.js developer' or 'Logo design'" 
              />
              <Button className="h-12 px-8 bg-brand text-brand-foreground hover:bg-brand/90 rounded text-base font-semibold">
                Search
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-white/80 text-sm font-medium">
              <span>Popular:</span>
              <span className="border border-white/30 rounded-full px-3 py-1 hover:bg-white/10 cursor-pointer transition-colors">Website Design</span>
              <span className="border border-white/30 rounded-full px-3 py-1 hover:bg-white/10 cursor-pointer transition-colors">WordPress</span>
              <span className="border border-white/30 rounded-full px-3 py-1 hover:bg-white/10 cursor-pointer transition-colors">Logo Design</span>
            </div>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Trending Services</h2>
          <Button variant="outline" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {talents.map((talent) => (
            <Card key={talent.id} className="group overflow-hidden border-transparent hover:border-border hover:shadow-xl transition-all duration-300 rounded-xl flex flex-col cursor-pointer bg-card">
              {/* Thumbnail */}
              <div className={`relative h-48 w-full ${talent.image} overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-white hover:bg-white/20 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
              
              <CardContent className="p-4 flex flex-col flex-1">
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="text-xs bg-secondary text-secondary-foreground font-bold">{talent.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground hover:underline">{talent.name}</span>
                    <span className="text-[10px] uppercase font-bold text-brand">{talent.level}</span>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-base font-medium leading-snug hover:text-brand transition-colors line-clamp-2 mb-3 flex-1">
                  {talent.title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm text-foreground">{talent.rating}</span>
                  <span className="text-muted-foreground text-sm">({talent.reviews})</span>
                </div>
                
                {/* Footer/Price */}
                <div className="flex items-center justify-between border-t pt-3 mt-auto">
                  <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Starting at</span>
                    <span className="font-bold text-lg text-foreground leading-none">{talent.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
