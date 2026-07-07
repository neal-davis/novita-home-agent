type BannerSchema = {
  title: string[];
  description?: string[];
  link: string;
  imgSrc?: string;
  iconSrc?: string;
  bgColor?: string;
};

type APISchema = {
  apiName: FUNC_NAME;
  productName?: string;
  iconName: string;
  imgs: string[];
  link?: string;
  isHot?: boolean;
};

type FeaturedAPIsSchema = {
  [key: string]: {
    iconName: string;
    data: APISchema[];
  };
};

type ModelSchema = {
  img: string;
  tags: string[];
  name: string;
  id: string;
  playground: FUNC_NAME;
  isHot?: boolean;
  link?: string;
};

type ModelsSchema = {
  [key: string]: {
    data: ModelSchema[];
  };
};

type VoiceSchema = {
  src: string;
  desc: string[];
  title: string;
  avatar: string;
  id: string;
};
