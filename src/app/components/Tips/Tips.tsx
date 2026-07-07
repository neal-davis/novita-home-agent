import { CircleHelp as QuestionCircleOutlined } from "lucide-react";
import classes from "./Tips.module.scss";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TipsProps = {
  trigger?: React.ReactNode;
  content: string[];
  triggerMode?: "hover" | "click";
};

export default function Tips({ trigger, content, triggerMode }: TipsProps) {
  const triggerNode = trigger || (
    <QuestionCircleOutlined className={classes.tips_question} />
  );
  const contentNode = (
    <div className={classes.tips_content}>
      {content.map((tip, index) => {
        return (
          <div key={index} className={classes.tip_item}>
            <span className={classes.tip_index}>{index + 1}</span>
            {tip}
          </div>
        );
      })}
    </div>
  );

  if (triggerMode === "click") {
    return (
      <Popover>
        <PopoverTrigger asChild>{triggerNode}</PopoverTrigger>
        <PopoverContent
          side="bottom"
          className="w-[340px] max-w-[calc(100vw-32px)] border-[var(--border)] bg-[var(--white)] px-4 py-[22px]"
        >
          {contentNode}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>{triggerNode}</HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        className="w-[340px] max-w-[calc(100vw-32px)] border-[var(--border)] bg-[var(--white)] px-4 py-[22px]"
      >
        {contentNode}
      </HoverCardContent>
    </HoverCard>
  );
}
