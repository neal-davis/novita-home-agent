import Image from "next/image";

export function ConsoleNotice({
  title,
  description,
  icon = (
    <div className="mt-2">
      <Image src={"/billing/warning.svg"} alt="notice" width={16} height={16} />
    </div>
  ),
}: {
  title?: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between px-3 py-4 border border-common-gray-2 rounded-md bg-common-gray-3">
      <div className="w-[30px] shrink-0">{icon}</div>
      <div className="flex flex-col gap-2 grow">
        {title && <div className="text-black text-sm font-medium">{title}</div>}
        <div className="text-common-dark-2 text-sm leading-5">
          {description}
        </div>
      </div>
    </div>
  );
}
