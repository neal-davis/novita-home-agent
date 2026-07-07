import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
// const { toClipboard } = useClipboard()
function copyText(e: any, content: string) {
  try {
    navigator.clipboard
      .writeText(String(content))
      .then(function () {
        message.success("Copy success");
      })
      .catch(function () {
        message.error("Copy failed");
      });
  } catch (e) {
    message.error("Copy failed");
  }
  e.stopPropagation();
}
export default function CopyButton({
  content = "",
  title = "",
  style,
  id,
  className,
}: {
  content?: string;
  title?: string;
  style?: any;
  id?: string;
  className?: string;
}) {
  return (
    <>
      <Button
        id={id}
        className={`ml-2 hover:text-[var(--brand-0)] ${className || ""}`}
        style={{
          padding: "0",
          border: "0",
          marginLeft: "5px",
          fontSize: "12px",
          width: "12px",
          height: "12px",
          ...style,
        }}
        type="link"
        icon={
          title ? (
            ""
          ) : (
            <span
              className={`iconfont icon-copy text-[var(--black)] hover:text-[var(--brand-0)]`}
              style={{
                width: "16px",
                height: "16px",
                marginBottom: "5px",
                fontSize: "12px",
              }}
            />
          )
        }
        onClick={(e) => copyText(e, content)}
      >
        {title}
      </Button>
    </>
  );
}
