import GrayBoxList from "@/app/components/pageComponents/GrayBoxList";
import styles from "./KeyFeature.module.css";
import * as icons from "./icons";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getData() {
  return [
    {
      title: "Real-time latency",
      desc: "Novita AI voice models can generate speech in <300ms.",
      icon: <icons.LatencyIcon />,
    },
    {
      title: "Expressive Voice",
      desc: "Explore voice styles: narrative, chat, joy, rage, sorrow, empathy.",
      icon: <icons.VoiceIcon />,
    },
    {
      title: "Reliability",
      desc: "Trust our robust infrastructure to deliver consistent, high-quality audio every time.",
      icon: <icons.ReliabilityIcon />,
    },
    {
      title: "Seamless Integration",
      desc: "Effortlessly incorporate our API, applications for a plug-and-play enhancement.",
      icon: <icons.IntegrationIcon />,
    },
    {
      title: "Customizable and Scalable",
      desc: "Tailor the voice to your brand's identity and scale up to meet the demands of your growing user base.",
      icon: <icons.CustomizeIcon />,
    },
    {
      title: "Developer-Friendly",
      desc: "With comprehensive documentation and 24/7 support, our API is designed to be a breeze for developers.",
      icon: <icons.FriendlyIcon />,
    },
  ];
}

export default function KeyFeature() {
  const data = getData();
  return (
    <div className={styles.page_wrap}>
      <div className="max_width_container">
        <div className="px-web">
          <h3 className="font-h3 mb-[48px] text-center">
            Novita AI Voice Key Features
          </h3>
          <div>
            <GrayBoxList data={data} noMobile itemStyles={{ height: 240 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
