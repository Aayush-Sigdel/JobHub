import { Button } from "@/components/ui/button";

const LandingSectionFive = () => {
  return (
    <section className="w-full bg-[#F5F5F3] py-32 px-6 flex flex-col items-center text-center">
      <span className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
        Fairness First
      </span>
      <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black mb-8 leading-[1.1]">
        hired for your skills,
        <br /> not your background
      </h2>
      <p className="text-lg font-medium text-gray-700 max-w-2xl mb-12">
        We actively implement bias-prevention measures in the hiring process.
        Our anonymization system hides surnames, profile pictures, and
        identifying information during the early shortlisting process.
      </p>

      <div className="bg-white border-2 border-black p-8 max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
        <div className="flex items-center gap-4 mb-4 opacity-50 blur-sm select-none">
          <div className="w-16 h-16 rounded-full bg-gray-300"></div>
          <div className="flex flex-col items-start gap-2">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
            <div className="h-3 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="border-t-2 border-dashed border-gray-200 my-4"></div>
        <div className="flex flex-col gap-2 text-left">
          <h4 className="font-black text-black text-xl">
            Top 1% React Developer
          </h4>
          <p className="text-gray-600 font-medium text-sm">
            Matching Score: 98% based on recent GitHub commits.
          </p>
        </div>
      </div>

      <Button className="bg-[#FFCC00] text-black hover:bg-[#E6B800] font-black uppercase tracking-wider text-lg px-12 py-8 rounded-none transition-colors">
        Learn about anonymization
      </Button>
    </section>
  );
};

export default LandingSectionFive;
