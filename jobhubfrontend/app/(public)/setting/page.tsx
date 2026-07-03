import DeleteAccountCard from "@/app/(applier)/_components/settings/DeleteAccountCard";
import PasswordCard from "@/app/(applier)/_components/settings/PasswordCard";

export default function SettingPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 shadow-2xl rounded-2xl border border-border mt-20 space-y-6 bg-background">
      <PasswordCard />
      <DeleteAccountCard />
    </div>
  );
}
