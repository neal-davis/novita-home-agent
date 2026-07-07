"use client";

import { useCallback, useState } from "react";
import { kv } from "@vercel/kv";
import { message } from "@/components/ui/standard/notify";
import { Loader2 } from "lucide-react";
import { ExternalLink as ExportOutlined } from "lucide-react";
import { debounce } from "lodash-es";
import { useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import styles from "./ShareLinkBtn.module.scss";
import Modal from "@/app/components/Modal/Modal";

type IProps = {
  params: Record<string, any>;
  seed: number;
};

export default function ShareLinkBtn(props: IProps) {
  const { params, seed } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const uuid = useAppSelector((state) => state.user.uuid);
  const isOperation = window.location.search.indexOf("operation") > -1;

  const handleShare = useCallback(async () => {
    setShareLink("");
    const shareId = `${Math.random().toString().slice(-3)}${uuid.slice(
      -3,
    )}${Math.floor(Date.now() / 1000).toString()}`;
    try {
      setIsModalOpen(true);
      const options = isOperation ? undefined : { ex: 2592000 };
      await kv.set(
        shareId,
        {
          ...params,
          seed,
        },
        options,
      );
      const { origin, pathname, hash } = window.location;
      const link = `${origin}${pathname}?share=${shareId}${hash}`;
      setShareLink(link);
    } catch (e) {
      console.error("Share link error: ", e);
      setIsModalOpen(false);
      message.error("Share link failed");
    }
  }, [params, seed, uuid, isOperation]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!shareLink) {
      return;
    }
    navigator.clipboard.writeText(shareLink);
    setIsModalOpen(false);
    message.success("Link copied successfully");
  }, [shareLink]);

  return (
    <>
      <span
        className={`${styles.button} ${styles.right}`}
        onClick={debounce(() => {
          handleShare();
        }, 500)}
      >
        <ExportOutlined style={{ marginRight: 8 }} />
        Share Link
      </span>
      <Modal
        title="Share link to reproduce Playground example"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        zIndex={1001}
        className={styles.shareLinkModal}
        styles={{
          mask: {
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,.35)",
          },
          content: {
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <div className={styles.content}>
          <div className={styles.linkBox}>
            {shareLink ? (
              <span className={styles.linkText}>{shareLink}</span>
            ) : (
              <Loader2
                className="animate-spin w-4 h-4"
                style={{ marginLeft: "48%" }}
              />
            )}
            <Button
              className={styles.copyBtn}
              onClick={handleCopy}
              style={{ opacity: shareLink ? 1 : 0.3 }}
            >
              COPY
            </Button>
          </div>
          <p style={{ opacity: shareLink ? 1 : 0.3 }}>
            {isOperation ? "Valid indefinitely" : "Valid for 30 days"}
          </p>
        </div>
      </Modal>
    </>
  );
}
