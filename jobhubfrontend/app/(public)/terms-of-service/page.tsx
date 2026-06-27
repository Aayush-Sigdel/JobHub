import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | JobHub",
  description: "Terms and conditions for using JobHub.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Last updated: October 2023
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">1. Acceptance of Terms</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            By accessing or using the JobHub platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">2. User Accounts</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
            <li>You are responsible for safeguarding the password that you use to access the Service.</li>
            <li>You agree not to disclose your password to any third party.</li>
            <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">3. Intellectual Property</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            The Service and its original content, features, and functionality are and will remain the exclusive property of JobHub and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">4. Prohibited Uses</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that violates any applicable national or international law or regulation, or to engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">5. Termination</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">6. Changes to Terms</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
