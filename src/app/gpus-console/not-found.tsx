import { DocFooter } from "./components/footer/Footer";
import styles from "./not-found.module.css";
import { ArrowRight as ArrowRightOutlined } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div>
      <div className={styles.error_page}>
        {/* <div className={styles.error_code}>ERROR CODE: 404</div> */}
        <h1 className={styles.title}>Page not found!</h1>
        <h2 className={styles.desc}>
          Sorry, we could not find the page you are looking for.
          <br />
          Go to homepage to view all our AI products.
        </h2>
        <a style={{ marginTop: "30px" }} href="/gpu-instance">
          <Button
            style={{
              background: "#11142D",
              borderRadius: "8px",
              height: "48px",
              textTransform: "none",
            }}
            variant="outline"
          >
            <span
              style={{
                fontSize: "14px",
                color: "#FFFFFF",
                textAlign: "center",
                lineHeight: "14px",
                marginRight: "5px",
                fontWeight: 700,
              }}
            >
              Go to home page
            </span>{" "}
            <ArrowRightOutlined style={{ color: "#fefefe" }} />
          </Button>
          {/* <Button
            style={{
              marginTop: "20px",
              borderRadius: "4px",
            }}
            height={48}
            fontsize={16}
            renderTag="link"
          >
            Go to home page <ArrowRightOutlined />
          </Button> */}
        </a>
        <div
          style={{
            width: "100%",
          }}
        >
          {/* <Hub showTitle={false} /> */}
        </div>
      </div>
      <DocFooter />
    </div>
  );
}
