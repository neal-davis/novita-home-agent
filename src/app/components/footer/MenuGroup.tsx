import Link from "next/link";
import { FooterMenu } from "./Footer";

export default function MenuGroup({ menu }: { menu: FooterMenu }) {
  return (
    <div
      className={`flex flex-col min-w-[160px]
      sm:pl-2 gap-2 sm:gap-4
      py-8 sm:pt-0 sm:pb-4
      border-gray-2
      sm:border-l-[1px]
      border-b-[1px] sm:border-b-0
    `}
    >
      <p className="font-small-console text-[var(--dark-2)]">
        {menu.label.toUpperCase()}
      </p>
      {menu.items.map((item) => {
        if ("el" in item) {
          return item.el;
        }
        return (
          <Link
            key={item.link}
            href={item.link}
            className={`font-subtle py-[8px] hover:underline`}
            id={item.elmID}
            target={item.linkTarget}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
