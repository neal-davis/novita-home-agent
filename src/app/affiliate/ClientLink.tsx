"use client";

import styles from "./page.module.scss";
import { useContext } from "react";
import { Context } from "./ClientWrapper";
import { Button } from "@/components/ui/button";

export function ClientLink() {
  const { affiliate } = useContext(Context);
  return (
    <div>
      <div className={`${styles.link_info_box}`}>
        <ul className={styles.list}>
          <li>
            1. Copy your affiliate link{" "}
            <a href={affiliate?.referralLink || ""} target="_blank">
              [
              {affiliate?.referralLink ? affiliate.referralLink : "ungenerated"}
              ]
            </a>
          </li>
          <li>2. Share the link to invite your friends</li>
          <li>
            3. Earn <span>10%</span> of their spending over 180 days
          </li>
        </ul>
      </div>
      <Button
        onClick={() => {
          window.open(
            "http://blogs.novita.ai/novita-ai-affiliate-program/",
            "_blank",
          );
        }}
        className="h-[40px]"
      >
        Learn More
      </Button>
    </div>
  );
}
