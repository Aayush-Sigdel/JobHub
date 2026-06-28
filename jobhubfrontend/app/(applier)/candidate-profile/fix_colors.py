import os

components_dir = "/home/batman/Projects/JobHub/jobhubfrontend/app/(applier)/candidate-profile/_components"

replacements = {
    # profile-about.tsx
    'className="flex items-start gap-2 p-4 bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-foreground rounded-lg"': 'className="flex items-start gap-2 p-4 bg-info/10 text-info border border-info/20 rounded-lg"',
    'className="px-5 py-2 text-[14px] font-medium text-foreground/80 hover:bg-muted dark:text-foreground dark:hover:bg-accent rounded-lg transition-colors"': 'className="px-5 py-2 text-[14px] font-medium text-foreground/80 border border-border bg-transparent hover:bg-muted rounded-lg transition-colors"',
    
    # profile-intro-video.tsx
    'className="bg-primary/5 w-32 h-24 rounded-xl flex items-center justify-center border border-border/50 dark:border-border flex-shrink-0 relative"': 'className="bg-success/10 w-32 h-24 rounded-xl flex items-center justify-center border border-success/20 flex-shrink-0 relative"',
    'className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm relative z-10 border border-primary/20"': 'className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm relative z-10 border border-success/30"',
    'className="w-5 h-5 text-primary"': 'className="w-5 h-5 text-success"',
    
    # languages-popover.tsx
    'className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-foreground/80 leading-relaxed"': 'className="flex items-start gap-2 bg-info/10 border border-info/20 rounded-lg p-3 text-sm text-foreground/80 leading-relaxed"',
    
    # general cancel buttons
    'className="px-5 py-2 rounded-lg font-semibold text-foreground/80 bg-muted hover:bg-muted-foreground/20 transition-colors"': 'className="px-5 py-2 rounded-lg font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted transition-colors"',
    
    # profile-looking-for-role.tsx cancel button
    'className="px-6 py-2 text-sm font-semibold text-foreground/80 bg-muted hover:bg-muted-foreground/20 rounded-lg transition-colors"': 'className="px-6 py-2 text-sm font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted rounded-lg transition-colors"',

    # location-popover cancel button
    'className="px-4 py-2 text-sm font-semibold text-foreground/80 bg-muted hover:bg-muted/80 rounded-lg transition-colors"': 'className="px-4 py-2 text-sm font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted rounded-lg transition-colors"',
    
    # profile-contact.tsx cancel buttons
    'className="px-4 py-2 text-sm font-semibold text-foreground/80 bg-muted hover:bg-muted/80 rounded-lg transition-colors"': 'className="px-4 py-2 text-sm font-semibold text-foreground/80 border border-border bg-transparent hover:bg-muted rounded-lg transition-colors"',
}

for filename in os.listdir(components_dir):
    if filename.endswith(".tsx"):
        filepath = os.path.join(components_dir, filename)
        with open(filepath, "r") as f:
            content = f.read()
        
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            
        if content != new_content:
            with open(filepath, "w") as f:
                f.write(new_content)
            print(f"Updated {filename}")

