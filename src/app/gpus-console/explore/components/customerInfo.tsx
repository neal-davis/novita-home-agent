"use client";

import styles from "./customerInfo.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import React from "react";
import { reqCollectUserCompany } from "@/api/gpu-instance/explore";
import { message } from "@/components/ui/standard/notify";

const placeholderStyle: React.CSSProperties = {
  marginLeft: "5px",
  fontWeight: 350,
  fontSize: "14px",
  color: "#808191",
  opacity: 0.5,
  lineHeight: "14px",
  textAlign: "left",
  fontStyle: "normal",
};

export default function CustomerInfo({ finishForm }: { finishForm: any }) {
  const [companyInfo, setCompanyInfo] = useState({
    stage: "",
    name: "",
    expectedGPUNumber: "",
    goal: "",
    source: "",
  });
  function changeCompanyInfo(item: string, e: any) {
    setCompanyInfo({ ...companyInfo, [item]: e.target.value });
  }
  function submitFun() {
    reqCollectUserCompany(companyInfo).then((res: any) => {
      message.success("success");
      finishForm();
    });
  }
  const placeholder = (text: string) => (
    <span style={placeholderStyle}>{text}</span>
  );
  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div className={styles.subSection}>
          <h1 className={styles.title}>Welcome to Novita AI</h1>
          <h2 className={styles.desc}>Tell us a bit more about yourself</h2>
          <div className={styles.mainSection}>
            <div className={styles.subtitle}>What stage are you at</div>
            {/* IconComponent={() => (<img src="/arrowDown.svg" />)} */}
            <Select
              value={companyInfo.stage}
              onValueChange={(value) =>
                changeCompanyInfo("stage", { target: { value } })
              }
            >
              <SelectTrigger
                className={styles.aniItem}
                style={{
                  maxWidth: "440px",
                  width: "100%",
                  height: "48px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                {companyInfo.stage || placeholder("Select an option")}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Playing around">Playing around</SelectItem>
                <SelectItem value="Developing">Developing</SelectItem>
                <SelectItem value="In production">In production</SelectItem>
              </SelectContent>
            </Select>

            <div className={styles.subtitle}>Company Name (Optional)</div>
            <Input
              className={styles.aniItem}
              placeholder="Input your company name"
              value={companyInfo.name}
              onChange={(e: any) => changeCompanyInfo("name", e)}
              style={{
                maxWidth: "440px",
                width: "100%",
                height: "52px",
                border: "1px solid rgba(217,219,233,1)",
                borderRadius: "8px",
                marginBottom: "24px",
                padding: "19px 20px",
              }}
            ></Input>

            <div className={styles.subtitle}>
              Expected number and type of GPUs needed?
            </div>
            <Input
              className={styles.aniItem}
              placeholder="Input expected number and GPUs type"
              value={companyInfo.expectedGPUNumber}
              onChange={(e: any) => changeCompanyInfo("expectedGPUNumber", e)}
              style={{
                maxWidth: "440px",
                width: "100%",
                height: "52px",
                border: "1px solid rgba(217,219,233,1)",
                borderRadius: "8px",
                marginBottom: "24px",
                padding: "19px 20px",
              }}
            ></Input>
            <div className={styles.subtitle}>What is your goal?</div>
            <Select
              value={companyInfo.goal}
              onValueChange={(value) =>
                changeCompanyInfo("goal", { target: { value } })
              }
            >
              <SelectTrigger
                className={styles.aniItem}
                style={{
                  maxWidth: "440px",
                  width: "100%",
                  height: "52px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                {companyInfo.goal || placeholder("Select an option")}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Select all that apply">
                  Select all that apply
                </SelectItem>
                <SelectItem value="Use models for company use-case">
                  Use models for company use-case
                </SelectItem>
                <SelectItem value="Use models in side project">
                  Use models in side project
                </SelectItem>
                <SelectItem value="Research purposes">
                  Research purposes
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div className={styles.subtitle}>How did you hear about us?</div>
            <Select
              value={companyInfo.source}
              onValueChange={(value) =>
                changeCompanyInfo("source", { target: { value } })
              }
            >
              <SelectTrigger
                className={styles.aniItem}
                style={{
                  maxWidth: "440px",
                  width: "100%",
                  height: "52px",
                  borderRadius: "8px",
                  marginBottom: "32px",
                }}
              >
                {companyInfo.source || placeholder("Select an option")}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Word of Mouth">Word of Mouth</SelectItem>
                <SelectItem value="Discord/Slack">Discord/Slack</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Button
                className={styles.aniItem}
                style={{
                  background: "#11142D",
                  maxWidth: "440px",
                  width: "100%",
                  height: "52px",
                  borderRadius: "8px",
                  textTransform: "none",
                }}
                onClick={() => submitFun()}
                variant="default"
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#FFFFFF",
                    lineHeight: "14px",
                    textAlign: "center",
                    fontStyle: "normal",
                  }}
                >
                  Submit
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
