"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MailIcon as Mail } from "@animateicons/react/lucide";;
import Link from "next/link";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-background rounded-[32px] p-8 md:p-12 border-2 border-border overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <Link href="/sign-in" className="flex items-center text-sm font-bold text-foreground/90 hover:text-foreground mb-8 transition-colors w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
              </Link>

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight leading-tight">Reset Password</h1>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-sm font-bold text-foreground">Email address</label>
                <Input 
                  type="email" 
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-2 border-border text-foreground bg-background px-4 font-medium focus-visible:ring-0 focus-visible:border-foreground" 
                />
              </div>

              <Button 
                disabled={!email}
                onClick={() => setIsSubmitted(true)}
                className="w-full h-12 rounded-xl text-base font-bold transition-all disabled:opacity-100 disabled:bg-muted disabled:text-slate-400 enabled:bg-slate-900 enabled:text-white enabled:hover:bg-slate-800"
              >
                Send Reset Link
              </Button>
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
                <Mail className="w-8 h-8" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Check your email</h1>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
                We have sent a password reset link to <br/><span className="text-foreground font-bold">{email}</span>
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full h-12 rounded-xl text-base font-bold border-2 border-border hover:border-foreground transition-colors"
              >
                Try another email
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
