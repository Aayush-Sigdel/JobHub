import PasswordCard from "@/app/(applier)/_components/settings/PasswordCard";
import TwoFactorCard from "@/app/(applier)/_components/settings/TwoFactorCard";
import SessionsCard from "@/app/(applier)/_components/settings/SessionsCard";
import NotificationSettingsCard from "@/app/(applier)/_components/settings/NotificationSettingsCard";
import DeleteAccountCard from "@/app/(applier)/_components/settings/DeleteAccountCard";
import { Shield, Bell, AlertTriangle } from "lucide-react";

export default function SettingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="border-b border-border/70 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            <span>Settings</span>
            <span>/</span>
            <span className="text-foreground">Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Account Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            Manage your credentials, two-factor authentication, active login sessions, notification preferences, and account controls.
          </p>
        </div>

        {/* Security & Login Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-muted border border-border/70 flex items-center justify-center text-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Security & Login</h2>
              <p className="text-xs text-muted-foreground">
                Keep your account secure with a strong password and multi-factor authentication.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <PasswordCard />
            <TwoFactorCard />
            <SessionsCard />
          </div>
        </section>

        {/* Notification Preferences Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-muted border border-border/70 flex items-center justify-center text-foreground">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                Control the frequency and types of alerts sent to your email and in-app feed.
              </p>
            </div>
          </div>
          <div>
            <NotificationSettingsCard />
          </div>
        </section>

        {/* Danger Zone Section */}
        <section className="space-y-4 pt-4 border-t border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-destructive/15 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-destructive">Danger Zone</h2>
              <p className="text-xs text-muted-foreground">
                Irreversible actions regarding your account and associated personal data.
              </p>
            </div>
          </div>
          <div>
            <DeleteAccountCard />
          </div>
        </section>
      </div>
    </div>
  );
}

