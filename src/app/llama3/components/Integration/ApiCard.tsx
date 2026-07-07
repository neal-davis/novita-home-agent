import * as React from "react";

export interface ApiInfoCardProps {
  title: string;
  content: React.ReactNode;
}

export default function ApiInfoCard({ title, content }: ApiInfoCardProps) {
  return (
    <div className="flex flex-col justify-center p-4 bg-common-gray-3 rounded-lg  min-h-[92px] max-md:max-w-full">
      <h3 className="font-h6">{title}</h3>
      <div className="font-body">{content}</div>
    </div>
  );
}
