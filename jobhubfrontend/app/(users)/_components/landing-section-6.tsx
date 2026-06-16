import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const LandingSectionSix = () => {
  return (
    <footer className="w-full flex flex-col">
      {/* Final CTA Area */}
      <section className="w-full bg-[#F5F5F3] py-24 flex flex-col items-center text-center px-6">
        <Image
          src={"/landing-illustrate-two.png"}
          alt="landing illustration 2"
          width={660}
          height={660}
          className="object-contain "
        />
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black mb-8 leading-[1.1]">
          We're obsessed <br /> with your potential
        </h2>
        <Button className="bg-[#FFCC00] text-black hover:bg-[#E6B800] font-black uppercase text-lg px-12 py-8 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          Join JobHub Today
        </Button>
      </section>

      {/* Actual Footer */}
      <section className="w-full bg-[#FFCC00] py-12 px-6 lg:px-24 border-t-4 border-black flex flex-col items-center">
        <div className="text-2xl font-black text-black mb-8">JOBHUB.</div>

        <div className="flex gap-6 mb-12 font-bold text-sm uppercase tracking-wider text-black">
          <Link
            href="#"
            className="hover:underline decoration-2 underline-offset-4"
          >
            Candidates
          </Link>
          <Link
            href="#"
            className="hover:underline decoration-2 underline-offset-4"
          >
            Recruiters
          </Link>
          <Link
            href="#"
            className="hover:underline decoration-2 underline-offset-4"
          >
            AI Specs
          </Link>
        </div>

        <p className="text-black font-medium text-sm text-center">
          © 2026 JobHub. A Project by Aayush Sigdel, Sugham Kharel, and Kamal
          Subedi.
        </p>
      </section>
    </footer>
  );
};

export default LandingSectionSix;
