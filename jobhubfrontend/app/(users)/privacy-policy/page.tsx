import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | JobHub",
  description: "Learn how JobHub protects your privacy and data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Last updated: October 2023
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">1. Introduction</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Welcome to JobHub. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">2. Information We Collect</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Personal Information:</strong> Names, phone numbers, email addresses, mailing addresses, job titles, contact preferences, contact or authentication data, and billing addresses.</li>
            <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number and the security code associated with your payment instrument.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">3. How We Use Your Information</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">4. Will Your Information Be Shared?</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">5. How Long Do We Keep Your Information?</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">6. How Do We Keep Your Information Safe?</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </p>
        </section>
      </div>
    </div>
  );
}
