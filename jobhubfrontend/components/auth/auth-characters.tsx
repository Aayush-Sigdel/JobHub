"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export type AuthFieldType =
  | "email"
  | "password"
  | "name"
  | "username"
  | "title"
  | "confirmPassword"
  | "none";

interface AuthCharactersProps {
  focusedField: AuthFieldType;
  showPassword?: boolean;
  isSubmitting?: boolean;
  isHoveringSubmit?: boolean;
  isHoveringGoogle?: boolean;
  emailValue?: string;
  passwordValue?: string;
  nameValue?: string;
  usernameValue?: string;
  errorMessage?: string;
  pageType?:
    "signin" | "signup" | "forget" | "verify" | "enterprise" | "onboarding";
  enterpriseStep?: number;
  onboardingStep?: number;
  className?: string;
}

export const AuthCharacters: React.FC<AuthCharactersProps> = ({
  focusedField,
  showPassword = false,
  isSubmitting = false,
  isHoveringSubmit = false,
  isHoveringGoogle = false,
  emailValue = "",
  passwordValue = "",
  nameValue = "",
  usernameValue = "",
  errorMessage = "",
  pageType = "signin",
  enterpriseStep = 1,
  onboardingStep = 1,
  className = "",
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setIsBlinking(true);
        const timeout = setTimeout(() => {
          setIsBlinking(false);
        }, 160);
        return () => clearTimeout(timeout);
      },
      3200 + Math.random() * 2500,
    );

    return () => clearInterval(blinkInterval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePos({ x, y });
  };

  const isPasswordFocused =
    focusedField === "password" || focusedField === "confirmPassword";
  const isInputFocused =
    focusedField === "email" ||
    focusedField === "name" ||
    focusedField === "username" ||
    focusedField === "title";
  const isPeeking = isPasswordFocused && showPassword;
  const isCovering = isPasswordFocused && !showPassword;

  // Eye gaze calculation
  const getPupilOffset = () => {
    if (errorMessage) {
      return { x: 5.5, y: 3.5 };
    }
    if (isPeeking) {
      return { x: 7.5, y: 3.5 };
    }
    if (isInputFocused) {
      return { x: 6.5, y: 1.5 };
    }
    if (isHoveringSubmit) {
      return { x: 5.5, y: 5.5 };
    }
    return {
      x: mousePos.x * 9,
      y: mousePos.y * 9,
    };
  };

  const pupil = getPupilOffset();

  // Dynamic dialogue & speaker
  const getDialogue = () => {
    if (isSubmitting) {
      return {
        speaker: "Orange",
        color: "#FF723B",
        text:
          pageType === "onboarding"
            ? "Setting up your candidate profile... 🚀"
            : pageType === "enterprise"
              ? "Submitting your enterprise request... 🚀"
              : pageType === "signup"
                ? "Creating your account... 🎉"
                : "Logging you in... Hang tight! ⏳",
      };
    }

    if (errorMessage) {
      return {
        speaker: "Shadow",
        color: "#EF4444",
        text:
          errorMessage.endsWith("!") ||
          errorMessage.endsWith(".") ||
          errorMessage.includes("⚠️") ||
          errorMessage.includes("❌")
            ? errorMessage
            : `${errorMessage} ⚠️`,
      };
    }

    // Onboarding Step-by-Step Flow Dialogue
    if (pageType === "onboarding") {
      if (isHoveringSubmit) {
        return {
          speaker: "Orange",
          color: "#FF723B",
          text: "Looks great! Click to complete your profile 🚀",
        };
      }
      if (onboardingStep === 1) {
        if (focusedField === "username") {
          return {
            speaker: "Shadow",
            color: "#18181D",
            text: usernameValue
              ? `@${usernameValue.replace(/^@/, "")} looks clean and memorable! 👌`
              : "Pick a unique username handle for your profile! 🆔",
          };
        }
        return {
          speaker: "Orange",
          color: "#FF723B",
          text: "Choose your unique username handle and professional title! ✨",
        };
      }
      if (onboardingStep === 2) {
        return {
          speaker: "Purple",
          color: "#6929FF",
          text: "What roles and work style match your goals? 💼",
        };
      }
      if (onboardingStep === 3) {
        return {
          speaker: "Pip",
          color: "#F2C418",
          text: "Add your top skills and location so recruiters can reach you! 🎯",
        };
      }
      if (onboardingStep === 4) {
        return {
          speaker: "Purple",
          color: "#6929FF",
          text: "Add your GitHub, portfolio, or resume so recruiters can see your work! 🚀",
        };
      }
    }

    if (pageType === "enterprise") {
      if (isHoveringSubmit) {
        return {
          speaker: "Orange",
          color: "#FF723B",
          text: "Ready to scale? Click to request your demo! 🚀",
        };
      }
      if (enterpriseStep === 1) {
        return {
          speaker: "Orange",
          color: "#FF723B",
          text: "What's the name of your company or organization? 🏢",
        };
      }
      if (enterpriseStep === 2) {
        return {
          speaker: "Purple",
          color: "#6929FF",
          text: nameValue
            ? `Great to meet you, ${nameValue.split(" ")[0]}! What's your role? 👋`
            : "Who are we speaking with today? Nice to meet you! 👋",
        };
      }
      if (enterpriseStep === 3) {
        return {
          speaker: "Shadow",
          color: "#18181D",
          text: "What's your official work email for the custom demo quote? ✉️",
        };
      }
      if (enterpriseStep === 4) {
        return {
          speaker: "Pip",
          color: "#F2C418",
          text: "Exciting growth ahead! How many roles are you hiring? 📈",
        };
      }
      if (enterpriseStep === 5) {
        return {
          speaker: "Purple",
          color: "#6929FF",
          text: "Any priority roles, tech stacks, or ATS needs on your mind? 🎯",
        };
      }
    }

    if (isHoveringSubmit) {
      return {
        speaker: "Orange",
        color: "#FF723B",
        text: "Ready to launch? Click to continue! 🚀",
      };
    }

    if (isHoveringGoogle) {
      return {
        speaker: "Purple",
        color: "#6929FF",
        text: "Quick 1-click Google authentication! ⚡",
      };
    }

    if (focusedField === "name") {
      if (!nameValue) {
        return {
          speaker: "Purple",
          color: "#6929FF",
          text: "What's your full name? Nice to meet you! 👋",
        };
      }
      return {
        speaker: "Orange",
        color: "#FF723B",
        text: `Great to meet you, ${nameValue.split(" ")[0]}! ✨`,
      };
    }

    if (focusedField === "email") {
      if (!emailValue) {
        return {
          speaker: "Orange",
          color: "#FF723B",
          text:
            pageType === "forget"
              ? "Enter your email for the reset instructions ✉️"
              : "What's your email address? ✉️",
        };
      }
      if (!emailValue.includes("@") || !emailValue.includes(".")) {
        return {
          speaker: "Shadow",
          color: "#18181D",
          text: "Don't forget the '@' and valid domain (e.g. .com) 🤔",
        };
      }
      return {
        speaker: "Orange",
        color: "#FF723B",
        text: "Valid email format! Looking clean 👍",
      };
    }

    if (isPasswordFocused) {
      if (showPassword) {
        return {
          speaker: "Purple",
          color: "#6929FF",
          text: "Ooooh, we can see your secret password now! 👀",
        };
      }
      if (!passwordValue) {
        return {
          speaker: "Orange",
          color: "#FF723B",
          text: "Shhh! Enter your password 🙈 We won't peek!",
        };
      }
      if (passwordValue.length < 8) {
        return {
          speaker: "Pip",
          color: "#F2C418",
          text: "Almost there! Keep going for 8+ characters 🔒",
        };
      }
      return {
        speaker: "Purple",
        color: "#6929FF",
        text: "That's a super strong & secure password! 💪",
      };
    }

    // Default Idle
    if (pageType === "signup") {
      return {
        speaker: "Purple",
        color: "#6929FF",
        text: "Join JobHub to discover thousands of dream jobs! 🌟",
      };
    }
    if (pageType === "forget") {
      return {
        speaker: "Pip",
        color: "#F2C418",
        text: "Don't worry, we'll help you get back into your account! 🔑",
      };
    }
    if (pageType === "verify") {
      return {
        speaker: "Orange",
        color: "#FF723B",
        text: "Check your inbox for the 6-digit verification code! 📬",
      };
    }

    return {
      speaker: "Orange",
      color: "#FF723B",
      text: "Welcome back! Enter your details to get started ✨",
    };
  };

  const currentDialogue = getDialogue();

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full flex flex-col justify-end items-center select-none overflow-hidden ${className}`}
    >
      {/* ========================================================= */}
      {/* HAND-DRAWN COMIC SPEECH BUBBLE (Hovering right above heads)*/}
      {/* ========================================================= */}
      <div className="relative w-full flex flex-col items-center px-4 z-20 mb-2 sm:mb-3">
        <motion.div
          animate={{
            y: [0, -6, 0, 5, 0],
            rotate: [-0.5, 0.5, -0.3, 0.4, -0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 5.5,
            ease: "easeInOut",
          }}
          className="relative flex flex-col items-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDialogue.text}
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={
                errorMessage
                  ? {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      x: [0, -7, 7, -5, 5, -2, 2, 0],
                    }
                  : { opacity: 1, scale: 1, y: 0, x: 0 }
              }
              exit={{ opacity: 0, scale: 0.88, y: -6 }}
              transition={{ type: "spring", stiffness: 360, damping: 24 }}
              className="relative"
            >
              {/* Hand-Drawn Sketch Accent Lines around the bubble */}
              <svg
                className="absolute -inset-3.5 w-[calc(100%+28px)] h-[calc(100%+38px)] pointer-events-none z-0"
                viewBox="0 0 420 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 60 4 Q 180 2 300 5 M 315 5 L 335 6"
                  stroke={errorMessage ? "#EF4444" : "#18181D"}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M 6 30 Q 3 60 7 88"
                  stroke={errorMessage ? "#EF4444" : "#18181D"}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M 412 85 Q 415 100 405 115"
                  stroke={errorMessage ? "#EF4444" : "#18181D"}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M 175 118 Q 188 126 198 125"
                  stroke={errorMessage ? "#EF4444" : "#18181D"}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Main Hand-Drawn Styled Comic Bubble */}
              <div
                className={`relative bg-white text-neutral-900 border-[3.2px] ${
                  errorMessage
                    ? "border-rose-500 shadow-[0_12px_24px_rgba(239,68,68,0.12)]"
                    : "border-[#18181D] shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                } rounded-[24px] sm:rounded-[28px] px-5 sm:px-6 py-3.5 max-w-sm sm:max-w-md flex items-center gap-3.5 z-10 transition-colors duration-200`}
              >
                {/* Speaker Dot */}
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border-2 border-[#18181D] shadow-sm animate-pulse"
                  style={{ backgroundColor: currentDialogue.color }}
                />

                {/* Speaker & Dialogue Copy */}
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${
                      errorMessage ? "text-rose-500" : "text-neutral-400"
                    }`}
                  >
                    {currentDialogue.speaker}
                  </span>
                  <p
                    className={`text-sm sm:text-base font-extrabold leading-snug ${
                      errorMessage ? "text-rose-700" : "text-neutral-900"
                    }`}
                  >
                    {currentDialogue.text}
                  </p>
                </div>

                {/* Hand-Drawn Comic Tail */}
                <div className="absolute -bottom-5 left-16 sm:left-20 w-8 h-6 overflow-visible pointer-events-none">
                  <svg viewBox="0 0 32 24" className="w-8 h-6 fill-white">
                    <path
                      d="M 0 0 C 4 8, 8 18, 16 22 C 14 14, 18 6, 28 0 Z"
                      fill="#FFFFFF"
                      stroke={errorMessage ? "#EF4444" : "#18181D"}
                      strokeWidth="3.2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <rect x="1" y="-2" width="26" height="4" fill="#FFFFFF" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ========================================================= */}
      {/* ANIMATED SVG CHARACTERS STAGE                            */}
      {/* ========================================================= */}
      <div className="w-full flex items-end justify-center">
        <svg
          viewBox="0 0 520 480"
          className="w-full h-auto max-h-[72vh] drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. PURPLE CHARACTER (Back-Left Tall Column) */}
          <motion.g
            animate={{
              y: isCovering ? 14 : isPeeking ? -10 : isInputFocused ? -4 : 0,
              rotate: isCovering
                ? -2.5
                : isPeeking
                  ? 4
                  : isInputFocused
                    ? 2
                    : 0,
              scaleY: [1, 1.01, 1],
            }}
            transition={{
              y: { type: "spring", stiffness: 240, damping: 18 },
              rotate: { type: "spring", stiffness: 240, damping: 18 },
              scaleY: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            }}
            style={{ transformOrigin: "170px 480px" }}
          >
            <rect
              x="95"
              y="70"
              width="155"
              height="410"
              rx="26"
              fill="#6929FF"
            />

            {/* Vertical Nose Slit */}
            <line
              x1="172"
              y1="114"
              x2="172"
              y2="152"
              stroke="#16161A"
              strokeWidth="5.5"
              strokeLinecap="round"
            />

            {/* Left Eye */}
            <g>
              <circle cx="138" cy="120" r="10" fill="#FFFFFF" />
              <motion.circle
                animate={{
                  cx: isBlinking || isCovering ? 138 : 138 + pupil.x,
                  cy: isBlinking || isCovering ? 120 : 120 + pupil.y,
                  r: isCovering ? 0 : isPeeking ? 6 : isBlinking ? 1.5 : 4.8,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                fill="#16161A"
              />
            </g>

            {/* Right Eye */}
            <g>
              <circle cx="206" cy="120" r="10" fill="#FFFFFF" />
              <motion.circle
                animate={{
                  cx: isBlinking || isCovering ? 206 : 206 + pupil.x,
                  cy: isBlinking || isCovering ? 120 : 120 + pupil.y,
                  r: isCovering ? 0 : isPeeking ? 6 : isBlinking ? 1.5 : 4.8,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                fill="#16161A"
              />
            </g>

            {/* Purple Character Hands */}
            <motion.g
              animate={{
                y: isCovering ? -48 : isPeeking ? -24 : 150,
                opacity: isCovering || isPeeking ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
              <motion.g
                animate={{
                  x: isPeeking ? -20 : 0,
                  rotate: isPeeking ? -18 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ellipse
                  cx="138"
                  cy="165"
                  rx="19"
                  ry="24"
                  fill="#541FD6"
                  stroke="#6929FF"
                  strokeWidth="2.5"
                />
                <circle cx="127" cy="152" r="6" fill="#541FD6" />
                <circle cx="138" cy="148" r="6" fill="#541FD6" />
                <circle cx="149" cy="152" r="6" fill="#541FD6" />
              </motion.g>

              <motion.g
                animate={{
                  x: isPeeking ? 20 : 0,
                  rotate: isPeeking ? 18 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ellipse
                  cx="206"
                  cy="165"
                  rx="19"
                  ry="24"
                  fill="#541FD6"
                  stroke="#6929FF"
                  strokeWidth="2.5"
                />
                <circle cx="195" cy="152" r="6" fill="#541FD6" />
                <circle cx="206" cy="148" r="6" fill="#541FD6" />
                <circle cx="217" cy="152" r="6" fill="#541FD6" />
              </motion.g>
            </motion.g>
          </motion.g>

          {/* 2. BLACK CHARACTER (Middle-Right Pillar) */}
          <motion.g
            animate={{
              y: isCovering ? 12 : isPeeking ? -16 : isInputFocused ? -6 : 0,
              x: isPeeking ? 8 : 0,
              rotate: isCovering ? 3 : isPeeking ? 5 : 0,
              scaleY: [1, 1.015, 1],
            }}
            transition={{
              y: { type: "spring", stiffness: 260, damping: 20 },
              scaleY: {
                repeat: Infinity,
                duration: 4.6,
                ease: "easeInOut",
                delay: 0.5,
              },
            }}
            style={{ transformOrigin: "295px 480px" }}
          >
            <rect
              x="235"
              y="170"
              width="105"
              height="310"
              rx="18"
              fill="#18181D"
            />

            {/* Left Eye */}
            <g>
              <circle cx="270" cy="205" r="10.5" fill="#FFFFFF" />
              {isCovering ? (
                <line
                  x1="262"
                  y1="205"
                  x2="278"
                  y2="205"
                  stroke="#18181D"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : (
                <motion.circle
                  animate={{
                    cx: isBlinking ? 270 : 270 + pupil.x,
                    cy: isBlinking ? 205 : 205 + pupil.y,
                    r: isPeeking ? 6.5 : isBlinking ? 1.5 : 5.2,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  fill="#18181D"
                />
              )}
            </g>

            {/* Right Eye */}
            <g>
              <circle cx="304" cy="205" r="10.5" fill="#FFFFFF" />
              {isCovering ? (
                <line
                  x1="296"
                  y1="205"
                  x2="312"
                  y2="205"
                  stroke="#18181D"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : (
                <motion.circle
                  animate={{
                    cx: isBlinking ? 304 : 304 + pupil.x,
                    cy: isBlinking ? 205 : 205 + pupil.y,
                    r: isPeeking ? 6.5 : isBlinking ? 1.5 : 5.2,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  fill="#18181D"
                />
              )}
            </g>
          </motion.g>

          {/* 3. ORANGE CHARACTER (Front-Left Dome) */}
          <motion.g
            animate={{
              scale: isHoveringSubmit ? [1, 1.04, 1] : 1,
              y: isCovering
                ? 10
                : isPeeking
                  ? -6
                  : isSubmitting
                    ? [0, -8, 0]
                    : 0,
              rotate: isCovering ? -2 : isPeeking ? -3 : 0,
            }}
            transition={{
              scale: { repeat: isHoveringSubmit ? Infinity : 0, duration: 0.8 },
              y: isSubmitting
                ? { repeat: Infinity, duration: 0.45 }
                : { type: "spring", stiffness: 280, damping: 18 },
            }}
            style={{ transformOrigin: "185px 480px" }}
          >
            <path d="M 15 480 A 170 170 0 0 1 355 480 Z" fill="#FF723B" />

            {/* Left Eye */}
            <g>
              <motion.circle
                animate={{
                  cx: isCovering ? 150 : 150 + pupil.x * 0.75,
                  cy: isCovering ? 418 : 418 + pupil.y * 0.75,
                  r: isCovering ? 0 : isBlinking ? 2 : isPeeking ? 7.5 : 6,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                fill="#18181D"
              />
              {!isCovering && !isBlinking && (
                <circle
                  cx={152 + pupil.x * 0.75}
                  cy={416 + pupil.y * 0.75}
                  r="2"
                  fill="#FFFFFF"
                />
              )}
            </g>

            {/* Mouth */}
            <motion.path
              animate={{
                d: isCovering
                  ? "M 172 438 Q 185 432 198 438"
                  : isPeeking
                    ? "M 170 432 Q 185 450 200 432 Z"
                    : "M 172 432 Q 185 446 198 432",
                fill: isPeeking ? "#18181D" : "none",
              }}
              stroke="#18181D"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Right Eye */}
            <g>
              <motion.circle
                animate={{
                  cx: isCovering ? 220 : 220 + pupil.x * 0.75,
                  cy: isCovering ? 418 : 418 + pupil.y * 0.75,
                  r: isCovering ? 0 : isBlinking ? 2 : isPeeking ? 7.5 : 6,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                fill="#18181D"
              />
              {!isCovering && !isBlinking && (
                <circle
                  cx={222 + pupil.x * 0.75}
                  cy={416 + pupil.y * 0.75}
                  r="2"
                  fill="#FFFFFF"
                />
              )}
            </g>

            {/* Orange Character Paws */}
            <motion.g
              animate={{
                y: isCovering ? -50 : isPeeking ? -22 : 120,
                opacity: isCovering || isPeeking ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.ellipse
                animate={{
                  cx: isPeeking ? 134 : 150,
                  cy: isPeeking ? 438 : 418,
                  rx: 16,
                  ry: 18,
                  rotate: isPeeking ? -22 : 0,
                }}
                fill="#E85A20"
              />
              <motion.ellipse
                animate={{
                  cx: isPeeking ? 236 : 220,
                  cy: isPeeking ? 438 : 418,
                  rx: 16,
                  ry: 18,
                  rotate: isPeeking ? 22 : 0,
                }}
                fill="#E85A20"
              />
            </motion.g>
          </motion.g>

          {/* 4. YELLOW CHARACTER (Front-Right Bird Arch) */}
          <motion.g
            animate={{
              y: isCovering ? 12 : isPeeking ? -10 : 0,
              rotate: isCovering
                ? 4.5
                : isPeeking
                  ? 6
                  : isInputFocused
                    ? 2.5
                    : 0,
              x: isPeeking ? 8 : 0,
              scaleY: [1, 1.012, 1],
            }}
            transition={{
              y: { type: "spring", stiffness: 280, damping: 20 },
              scaleY: {
                repeat: Infinity,
                duration: 3.8,
                ease: "easeInOut",
                delay: 1,
              },
            }}
            style={{ transformOrigin: "395px 480px" }}
          >
            <path
              d="M 310 480 L 310 330 A 62 62 0 0 1 434 330 L 434 480 Z"
              fill="#F2C418"
            />

            {/* Eye */}
            <g>
              {isCovering ? (
                <line
                  x1="342"
                  y1="310"
                  x2="356"
                  y2="310"
                  stroke="#18181D"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <motion.circle
                    animate={{
                      cx: isBlinking ? 349 : 349 + pupil.x * 0.6,
                      cy: isBlinking ? 310 : 310 + pupil.y * 0.6,
                      r: isPeeking ? 6.5 : isBlinking ? 1.5 : 5.2,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    fill="#18181D"
                  />
                  {!isBlinking && (
                    <circle
                      cx={350.5 + pupil.x * 0.6}
                      cy={308.5 + pupil.y * 0.6}
                      r="1.6"
                      fill="#FFFFFF"
                    />
                  )}
                </>
              )}
            </g>

            {/* Horizontal Beak / Mouth Line */}
            <motion.rect
              animate={{
                width: isPeeking ? 70 : 60,
                x: isPeeking ? 368 : 365,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              y="324"
              height="9.5"
              rx="4.75"
              fill="#18181D"
            />
          </motion.g>
        </svg>
      </div>
    </div>
  );
};
