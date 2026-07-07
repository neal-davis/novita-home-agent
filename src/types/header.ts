export type NavMenuItem = {
  elmId?: string;
  title: string | React.ReactNode;
  key: string;
  path?: string;
  altPaths?: string[];
  onClick?: () => void;
  disabled?: boolean;
  dropdown?: NavMenuItem[];
  linkTarget?: "_blank" | "_self";
  itemRender?: (item: NavMenuItem) => React.ReactNode;
  isCategory?: boolean;
  isBack?: boolean;
  openInNewTab?: boolean;
  id?: string;
};

export type ConsoleProduct =
  | "main"
  | "models"
  | "gpus"
  | "sandbox"
  | "billing"
  | "quota-limits"
  | "settings";
