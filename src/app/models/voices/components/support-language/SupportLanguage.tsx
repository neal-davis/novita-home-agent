import Image from "next/image";
import styles from "./SupportLanguage.module.scss";

const langs = [
  {
    name: "English",
    flag: "/product/txt2speech/flag_us.png",
  },
  {
    name: "Chinese",
    flag: "/product/txt2speech/flag_cn.png",
  },
  {
    name: "Japanese",
    flag: "/product/txt2speech/flag_jp.png",
  },
];

export default function SupportLanguage() {
  return (
    <div className={`${styles.page_wrap}`}>
      <div className="max_width_container h-full">
        <div className="px-web h-full flex justify-between items-center gap-[32px]">
          <h3 className={`font-h3`}>Support Languages</h3>
          <div className="flex justify-center gap-[24px]">
            {langs.map((one) => (
              <div
                className={`${styles.lang_item} flex items-center gap-[10px]`}
                key={one.name}
              >
                <Image src={one.flag} alt={one.name} width={40} height={40} />
                <span className="font-p">{one.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
