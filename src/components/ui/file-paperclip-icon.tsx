
import * as React from "react";
import { cn } from "@/lib/utils";

export const FilePaperclipIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => (
    <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("lucide lucide-file-paperclip", className)}
        {...props}
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <path d="M13 10.5a2.5 2.5 0 0 0-5 0V18a5 5 0 0 0 10 0v-8" />
        <path d="M14 2v6h6" />
    </svg>
));
FilePaperclipIcon.displayName = "FilePaperclipIcon";
