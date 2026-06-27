"use client";

import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { MailIcon as Mail, CheckIcon as Check, EyeIcon as Eye, EyeOffIcon as EyeOff } from "@animateicons/react/lucide";;
import Link from "next/link";
import Image from "next/image";
import {
  IconBrandApple,
  IconBrandFacebook,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Input } from "../ui/input";

export const SignInModal = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const newLocal = "/sign-up";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full max-w-4xl h-[720px] max-h-[95vh] rounded-[32px] overflow-hidden bg-background border-2 border-border"
    >
      {/* Left Pane - Image Background */}
      <div className="w-1/2 hidden md:flex flex-col relative border-r-2 border-border overflow-hidden">
        <Image 
          src="/images/sign_in_bg.png" 
          alt="Sign In Background" 
          fill 
          className="object-cover object-bottom" 
          priority
        />
        <div className="absolute inset-0 bg-foreground/10"></div>
        <div className="relative z-10 p-12 flex flex-col pt-16">
          <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
            Success starts here
          </h1>
          <div className="flex flex-col gap-5 text-white/95">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 mt-0.5 shrink-0" />
              <span className="text-lg font-medium leading-snug">Over 700 categories</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 mt-0.5 shrink-0" />
              <span className="text-lg font-medium leading-snug">Quality work done faster</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 mt-0.5 shrink-0" />
              <span className="text-lg font-medium leading-snug">Access to talent and businesses across the globe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full md:w-1/2 flex flex-col bg-background p-8 md:p-12 relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            <motion.div
              key="social-buttons"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full justify-center"
            >
              <div className="text-center mb-10">
                <h1 className="font-black text-3xl tracking-tight text-foreground mb-2">Welcome back</h1>
                <p className="text-muted-foreground font-medium">
                  Don’t have an account?{" "}
                  <Link href="/sign-up" className="text-foreground hover:text-tuscan-sun-500 transition-colors underline decoration-2 underline-offset-4 font-bold">
                    Join here
                  </Link>
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl text-base font-bold border-2 border-border hover:border-foreground hover:bg-transparent transition-all">
                  <IconBrandGoogle className="w-5 h-5" />
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl text-base font-bold border-2 border-border hover:border-foreground hover:bg-transparent transition-all">
                  <IconBrandApple className="w-5 h-5" />
                  Continue with Apple
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl text-base font-bold border-2 border-border hover:border-foreground hover:bg-transparent transition-all">
                  <IconBrandFacebook className="w-5 h-5 text-blue-600" />
                  Continue with Facebook
                </Button>

                <div className="flex items-center my-2 w-full">
                  <Separator className="flex-1 bg-slate-200 h-0.5" />
                  <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                  <Separator className="flex-1 bg-slate-200 h-0.5" />
                </div>

                <Button onClick={() => setShowEmailForm(true)} className="w-full h-12 rounded-xl text-base font-bold bg-tomato-500 hover:bg-tomato-600 text-white transition-all group border-2 border-tomato-500">
                  <Mail className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> 
                  Continue with email
                </Button>
              </div>

              <div className="mt-8 text-center text-xs font-medium text-muted-foreground leading-relaxed">
                <p>
                  By joining, you agree to JobHub's{" "}
                  <Link href="/terms-of-service" className="text-foreground underline decoration-1 underline-offset-2 font-bold hover:text-tuscan-sun-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-foreground underline decoration-1 underline-offset-2 font-bold hover:text-tuscan-sun-500">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full pt-2"
            >
              <button onClick={() => setShowEmailForm(false)} className="flex items-center text-sm font-bold text-foreground/90 hover:text-foreground mb-8 transition-colors w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight leading-tight">Continue with your email or username</h2>
                <p className="text-muted-foreground text-sm font-medium">Additional verification may be required at a later stage</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Email or username</label>
                  <Input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-2 border-border text-foreground bg-background px-4 font-medium focus-visible:ring-0 focus-visible:border-foreground" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Password</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-2 border-border text-foreground bg-background px-4 pr-12 font-medium focus-visible:ring-0 focus-visible:border-foreground" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Link href="/forget-password" className="text-sm font-bold text-foreground/90 hover:text-foreground underline decoration-1 underline-offset-4">Forgot password?</Link>
                  </div>
                </div>
              </div>

              <Button 
                disabled={!email || !password} 
                className="w-full h-12 rounded-xl text-base font-bold mt-8 transition-all disabled:opacity-100 disabled:bg-muted disabled:text-slate-400 enabled:bg-tomato-500 enabled:text-white enabled:hover:bg-tomato-600"
              >
                Sign in
              </Button>
              
              <div className="mt-auto pt-8 text-xs font-medium text-muted-foreground leading-relaxed">
                <p>
                  By joining, you agree to the JobHub{" "}
                  <Link href="/terms-of-service" className="text-muted-foreground underline decoration-1 underline-offset-2 hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and to occasionally receive emails from us. Please read our{" "}
                  <Link href="/privacy-policy" className="text-green-700 underline decoration-1 underline-offset-2 hover:text-green-800 font-medium">
                    Privacy Policy
                  </Link>{" "}
                  to learn how we use your personal data.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
