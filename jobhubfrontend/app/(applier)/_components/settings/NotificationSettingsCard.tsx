'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function NotificationSettingsCard() {
  const [preferences, setPreferences] = useState({
    applicationUpdates: true,
    jobMatches: true,
    assessmentReminders: true,
    recruiterMessages: true,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    const newValue = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: newValue }));
    toast.success('Notification preference saved');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-5">
        <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/70 flex items-center justify-center shrink-0">
          <Bell className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Notification Preferences</h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
            Choose what updates and reminders you receive via email and in-app notifications.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/60 border-t border-border/60">
        {/* Application Updates */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="notif-app" className="text-sm font-semibold text-foreground cursor-pointer">
              Application status updates
            </Label>
            <p className="text-xs text-muted-foreground">
              Get notified when an employer reviews, shortlists, or updates your submitted application.
            </p>
          </div>
          <Switch
            id="notif-app"
            checked={preferences.applicationUpdates}
            onCheckedChange={() => handleToggle('applicationUpdates')}
            className="cursor-pointer"
          />
        </div>

        {/* Job Match Recommendations */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="notif-match" className="text-sm font-semibold text-foreground cursor-pointer">
              Job match recommendations
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive alerts when new jobs match your skills and experience level with 40%+ affinity.
            </p>
          </div>
          <Switch
            id="notif-match"
            checked={preferences.jobMatches}
            onCheckedChange={() => handleToggle('jobMatches')}
            className="cursor-pointer"
          />
        </div>

        {/* Assessment Reminders */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="notif-test" className="text-sm font-semibold text-foreground cursor-pointer">
              Assessment and test reminders
            </Label>
            <p className="text-xs text-muted-foreground">
              Reminders about pending coding tests, SQL tasks, and design submissions.
            </p>
          </div>
          <Switch
            id="notif-test"
            checked={preferences.assessmentReminders}
            onCheckedChange={() => handleToggle('assessmentReminders')}
            className="cursor-pointer"
          />
        </div>

        {/* Recruiter Messages */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="notif-msg" className="text-sm font-semibold text-foreground cursor-pointer">
              Recruiter and employer messages
            </Label>
            <p className="text-xs text-muted-foreground">
              Direct communications and interview requests sent by hiring managers.
            </p>
          </div>
          <Switch
            id="notif-msg"
            checked={preferences.recruiterMessages}
            onCheckedChange={() => handleToggle('recruiterMessages')}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
