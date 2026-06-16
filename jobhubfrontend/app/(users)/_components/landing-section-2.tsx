import { Button } from "@/components/ui/button";
import { Database, Code2, BellRing, ShieldClose } from "lucide-react";

const LandingSectionTwo = () => {
  return (
    <section className="w-full bg-[#F5F5F3] py-32 px-6 flex flex-col items-center text-center">
      <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black mb-6 leading-[1.1]">
        Advanced tools for <br className="hidden md:block" />a fairer search
      </h2>
      <p className="text-lg font-medium text-gray-700 max-w-2xl mb-20">
        We go beyond simple keyword matching. JobHub uses transparent AI models
        and deep profiling to ensure high-quality, unbiased recruitment.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto w-full mb-20">
        {/* Feature 1 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Database className="w-12 h-12 text-black mb-4" strokeWidth={2} />
          <h3 className="text-2xl font-black text-black">Clean Job Data</h3>
          <p className="text-gray-700 font-medium max-w-[250px]">
            No duplicate or expired listings. We scrape sources and use ML-based
            deduplication for a flawless feed.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Code2 className="w-12 h-12 text-black mb-4" strokeWidth={2} />
          <h3 className="text-2xl font-black text-black">Deep Profiling</h3>
          <p className="text-gray-700 font-medium max-w-[250px]">
            We extract data from your GitHub and portfolio websites to provide
            highly personalized AI recommendations.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldClose className="w-12 h-12 text-black mb-4" strokeWidth={2} />
          <h3 className="text-2xl font-black text-black">Unbiased Hiring</h3>
          <p className="text-gray-700 font-medium max-w-[250px]">
            A built-in censorship system hides personal candidate information
            during the early shortlisting process.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <BellRing className="w-12 h-12 text-black mb-4" strokeWidth={2} />
          <h3 className="text-2xl font-black text-black">Smart Matching</h3>
          <p className="text-gray-700 font-medium max-w-[250px]">
            Recruiters see detailed matching scores, and our system
            automatically notifies the top candidates for new roles.
          </p>
        </div>
      </div>

      <Button
        size="lg"
        className="bg-[#FFCC00] text-black hover:bg-[#E6B800] font-black uppercase tracking-wider text-lg px-12 py-8 rounded-none transition-colors"
      >
        View Transparent AI Specs
      </Button>
    </section>
  );
};

export default LandingSectionTwo;
