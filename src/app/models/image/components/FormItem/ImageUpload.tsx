import Dragger from "@/app/components/dragger/Dragger";

type ImageUploadProps = {
  onChange: (url: string) => void;
  value: string;
  disabled?: boolean;
};

export default function ImageUpload(props: ImageUploadProps) {
  return (
    <>
      <Dragger
        disabled={props.disabled}
        onUpload={(url: string) => {
          props.onChange(url || "");
        }}
        curValue={props.value || ""}
        draggerStyle={{ flex: "1 1 244px", width: "auto", maxWidth: 244 }}
      />
    </>
  );
}
