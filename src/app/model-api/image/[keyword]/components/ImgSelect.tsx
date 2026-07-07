"use client";

import { PreviewImage } from "@/components/ui/standard/preview-image";

export default function ImgSelected({
  imgList,
  slected,
  setSelected,
  title,
}: {
  imgList: Array<{
    imgSrc: string;
    prompt: string;
  }>;
  slected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  title: string;
}) {
  const selectItem = imgList[slected];
  return (
    <div className="flex flex-col items-center justify-center px-10">
      <h2 className="text-xl mb-6 w-3/5 font-extrabold text-center">{title}</h2>
      <p className="w-3/5 mb-4 text-center">{selectItem?.prompt}</p>
      <PreviewImage
        width={420}
        src={selectItem?.imgSrc}
        alt={selectItem?.prompt}
      />
      <div className="mt-4 mb-8">
        <div className="flex justify-center gap-4">
          {imgList.map((item, index) => (
            <PreviewImage
              key={index}
              width={100}
              src={item.imgSrc}
              onClick={() => {
                setSelected(index);
              }}
              alt={item?.prompt}
              preview={false}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
