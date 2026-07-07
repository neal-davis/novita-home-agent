import Link from "next/link";
import { ButtonArrow } from "@/components/ui/button";
import getCampaignConfig from "@/config/campaign";
import styles from "./HomeLabel.module.scss";

interface HomeCampaignLabelProps {
  badgeText?: string;
  linkText?: string;
  href?: string;
  openInNewTab?: boolean;
}

export const HomeCampaignLabel = (props: HomeCampaignLabelProps) => {
  const campaign = getCampaignConfig();
  const {
    badgeText = campaign.HomeCampaignLabelText,
    linkText = campaign.HomeCampaignLabelLinkText,
    href = campaign.campaignUrl,
    openInNewTab = true,
  } = props;

  if (!campaign.enabled) {
    return null;
  }

  return (
    <div className={styles.campaign_container}>
      <span className={styles.campaign_badge}>{badgeText}</span>
      <Link
        href={href}
        className={styles.campaign_entry}
        target={openInNewTab ? "_blank" : undefined}
      >
        {linkText}
        <ButtonArrow />
      </Link>
    </div>
  );
};
