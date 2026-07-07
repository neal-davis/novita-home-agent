import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import type { ComponentProps, HTMLAttributes } from "react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full items-start justify-end gap-2 py-2",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end",
      // "[&>div]:max-w-[80%]",
      className,
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 rounded-lg px-4 py-3 text-foreground text-sm",
      "group-[.is-user]:bg-[var(--gray-2)] group-[.is-user]:text-primary-foreground group-[.is-user]:px-[6px] group-[.is-user]:py-2",
      "group-[.is-assistant]:bg-none group-[.is-assistant]:text-foreground group-[.is-assistant]:p-0",
      "is-user:dark",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar
    className={cn(
      "flex items-center justify-center size-6 shrink-0",
      className,
    )}
    {...props}
  >
    <AvatarImage alt="" className="mt-0 mb-0 size-4" src={src} />
    <AvatarFallback>{"AI"}</AvatarFallback>
  </Avatar>
);
