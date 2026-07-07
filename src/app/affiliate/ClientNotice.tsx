"use client";

import { useAppSelector } from "@/store";
import styles from "./page.module.scss";
import { useContext } from "react";
import { Context } from "./ClientWrapper";
import { LinkText } from "./LinkText";
import { AFFILIATE_LOGIN_URL } from "@/constants/urls";

export function ClientNotice() {
  const email = useAppSelector((state) => state.user.email);
  const { affiliate } = useContext(Context);
  return (
    <div className={`${styles.notice_container} ${styles.box}`}>
      <div className={styles.icon}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12.0016 1.35156C6.11973 1.35156 1.35156 6.11973 1.35156 12.0016C1.35156 17.8834 6.11973 22.6516 12.0016 22.6516C17.8834 22.6516 22.6516 17.8834 22.6516 12.0016C22.6516 6.11973 17.8834 1.35156 12.0016 1.35156ZM11.1016 14.2516V6.75156H12.9016V14.2516H11.1016ZM11.1016 17.2516V15.7516H12.9016V17.2516H11.1016Z"
            fill="black"
          />
        </svg>
      </div>
      <div className={styles.content}>
        <div className={styles.d1}>
          All withdrawals are handled by Tapfiliate. Please log in using the
          credentials below:
        </div>
        <ul className={styles.ul}>
          <li>
            Platform URL:{" "}
            <LinkText text={AFFILIATE_LOGIN_URL}>
              <a
                href={AFFILIATE_LOGIN_URL}
                target="_blank"
                style={{
                  textDecoration: "underline",
                }}
              >
                [{AFFILIATE_LOGIN_URL}]
              </a>
            </LinkText>
          </li>
          <li>
            Username: <LinkText text={email}>[{email}]</LinkText>
          </li>
          <li>
            Initial Password:{" "}
            <LinkText text={affiliate?.password}>
              [{affiliate?.password ? affiliate.password : "ungenerated"}]
            </LinkText>
          </li>
        </ul>
      </div>
    </div>
  );
}
