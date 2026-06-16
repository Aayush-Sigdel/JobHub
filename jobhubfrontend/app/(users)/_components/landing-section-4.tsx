import { Button } from "@/components/ui/button";

const LandingSectionFour = () => {
  return (
    <section className="w-full bg-[#FFCC00] py-32 px-6 flex flex-col items-center">
      <div className="flex flex-col gap-32 max-w-3xl mx-auto text-center w-full">
        {/* Block 1 */}
        <div className="flex flex-col items-center gap-6">
          <span className="text-sm font-bold uppercase tracking-widest text-black">
            Data Aggregation
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
            no endless duplicates
          </h2>
          <p className="text-xl font-medium text-black max-w-lg">
            Say goodbye to redundant and expired vacancies. Our ML-based
            deduplication cleans up job postings from multiple sources so you
            only see what's fresh.
          </p>
          <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
            See how it works
          </Button>
        </div>

        {/* Block 2 */}
        <div className="flex flex-col items-center gap-6">
          <span className="text-sm font-bold uppercase tracking-widest text-black">
            AI Transparency
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
            open algorithms
          </h2>
          <p className="text-xl font-medium text-black max-w-lg">
            No hidden black-box models. The specifications of our personalized
            job recommendation system are publicly disclosed and fully
            accessible.
          </p>
          <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
            Read the specs
          </Button>
        </div>

        {/* Block 3 */}
        <div className="flex flex-col items-center gap-6">
          <span className="text-sm font-bold uppercase tracking-widest text-black">
            Deep Profiling
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
            beyond the resume
          </h2>
          <p className="text-xl font-medium text-black max-w-lg">
            We analyze more than just platform data. By extracting insights from
            your GitHub and portfolio websites, we capture your true
            capabilities.
          </p>
          <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
            Connect your GitHub
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingSectionFour;
