import Link from "next/link";
import { Settings2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollaboratorDirectory } from "./_components/collaborator-directory";

export default function CollaboratorsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl py-2 md:py-4">
      <header className="mb-7 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
              <Users className="size-5" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Find collaborators
            </h1>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Meet candidates whose experience, skills, and professional interests
            align with yours.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full rounded-xl sm:w-auto"
        >
          <Link href="/candidate-profile#collaboration-visibility">
            <Settings2 className="mr-2 size-4" /> Profile visibility
          </Link>
        </Button>
      </header>

      <CollaboratorDirectory />
    </div>
  );
}
