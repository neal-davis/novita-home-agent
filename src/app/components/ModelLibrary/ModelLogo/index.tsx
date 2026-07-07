import Image, { type ImageProps } from "next/image";
import { getModelLogoFromConfig } from "./modelLogoConfig";
import styles from "./index.module.scss";

interface ModelLogoProps {
  className?: string;
  loading?: ImageProps["loading"];
  logo?: string;
  modelName: string;
  vendorName?: string;
  size?: number;
}

export default function ModelLogo({
  className,
  loading,
  logo,
  modelName,
  vendorName,
  size = 28,
}: ModelLogoProps) {
  const modelLogoResult = getModelLogoFromConfig(modelName);
  const vendorLogoResult =
    !modelLogoResult.logoPath &&
    !modelLogoResult.ModelIcon &&
    vendorName &&
    vendorName !== modelName
      ? getModelLogoFromConfig(vendorName)
      : null;

  const { logoPath, ModelIcon, preferModelIcon } =
    vendorLogoResult ?? modelLogoResult;

  if (logoPath) {
    return (
      <Image
        className={className}
        src={logoPath}
        alt={modelName}
        width={size}
        height={size}
        loading={loading}
      />
    );
  } else if (preferModelIcon && ModelIcon) {
    return (
      <div>
        <ModelIcon size={size} />
      </div>
    );
  } else if (logo) {
    return (
      <Image
        className={className}
        src={logo}
        alt={modelName}
        width={size}
        height={size}
        loading={loading}
      />
    );
  } else if (ModelIcon) {
    return (
      <div>
        <ModelIcon size={size} />
      </div>
    );
  }

  const firstLetter = modelName.charAt(0).toUpperCase();
  return (
    <span
      className={styles.default_logo}
      style={{
        width: size,
        height: size,
        fontSize: size / 2,
        lineHeight: size + "px",
      }}
    >
      {firstLetter}
    </span>
  );
}
