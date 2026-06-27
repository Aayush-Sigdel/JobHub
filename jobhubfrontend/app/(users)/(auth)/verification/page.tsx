"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newCode = [...code];
    // Handle pasting
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      pasted.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      const nextFocus = Math.min(index + pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every(digit => digit !== "");

  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-background rounded-[32px] p-8 md:p-12 border-2 border-border overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight leading-tight">Verify Email</h1>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  We sent a 6-digit verification code to your email. Enter it below to verify your account.
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-10">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6} // allow paste
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-black text-foreground bg-background border-2 border-border rounded-xl focus:border-slate-900 focus:ring-0 outline-none transition-colors"
                  />
                ))}
              </div>

              <Button 
                disabled={!isComplete}
                onClick={() => setIsVerified(true)}
                className="w-full h-12 rounded-xl text-base font-bold transition-all disabled:opacity-100 disabled:bg-slate-100 disabled:text-slate-400 enabled:bg-slate-900 enabled:text-white enabled:hover:bg-slate-800"
              >
                Verify Account
              </Button>
              
              <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
                Didn't receive the code?{" "}
                <button className="text-foreground font-bold hover:text-amber-500 transition-colors underline decoration-2 underline-offset-4">
                  Resend
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center h-full py-4"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Email Verified!</h1>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
                Your account has been successfully verified. You can now access all features.
              </p>
              <Link href="/" className="w-full">
                <Button 
                  className="w-full h-12 rounded-xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors group border-2 border-slate-900"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
