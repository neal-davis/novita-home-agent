"use client";

import { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { message } from "@/components/ui/standard/notify";
import { userQuestionnaire } from "@/api/user";
import { useAppSelector } from "@/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useI18n } from "@/i18n/provider";

type CustomerInfoFormValues = {
  company: string;
  monthlySpend?: string;
  name: string;
  role?: string;
};

function createRoleList() {
  return [
    { value: "Developer", label: "Developer" },
    { value: "Researcher", label: "Researcher" },
    { value: "Startup Founder", label: "Startup Founder" },
    { value: "Executive / Manager", label: "Executive / Manager" },
    { value: "Product Manager", label: "Product Manager" },
    { value: "Student", label: "Student" },
    { value: "Other", label: "Other" },
  ];
}

const spendList = [
  { value: "$0 - $10", label: "$0 - $10" },
  { value: "$10 - $100", label: "$10 - $100" },
  { value: "$100 - $1,000", label: "$100 - $1,000" },
  { value: "$1,000 - $10,000", label: "$1,000 - $10,000" },
  { value: ">$10,000", label: ">$10,000" },
];

function createFormSchema() {
  return z.object({
    name: z.string().min(1, "Name is required"),
    company: z.string().min(1, "Company / Organization is required"),
    role: z.string().optional(),
    monthlySpend: z.string().optional(),
  });
}

export default function CustomerInfo() {
  useI18n();
  const thirdPartyName = useAppSelector((state) => state.user.thirdPartyName);
  const isQuestionnaire = useAppSelector((state) => state.user.isQuestionnaire);

  const [showCustomerInfo, setShowCustomerInfo] = useState(
    isQuestionnaire === false,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showCustomerInfo) {
      analytics.trackExposure(
        CLICK_BTN_IDs.MAIN_CONSOLE.QUESTIONNAIRE_EXPOSURE,
      );
    }
  }, [showCustomerInfo]);

  const roleList = createRoleList();
  const formSchema = createFormSchema();

  const form = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: thirdPartyName || "",
      company: "",
      role: "",
      monthlySpend: "",
    },
  });

  const handleSubmit = async (values: CustomerInfoFormValues) => {
    setIsSubmitting(true);
    try {
      await userQuestionnaire(values);
      message.success("Information submitted successfully");
    } catch (error) {
      //
    } finally {
      setIsSubmitting(false);
      setShowCustomerInfo(false);
    }
  };

  const handleClose = () => {
    setShowCustomerInfo(false);
  };

  return (
    <>
      <Dialog open={showCustomerInfo}>
        <DialogContent className={styles.modal_content} closeable={false}>
          <div className={styles.icon_wrapper}>
            <FileText className={styles.icon} />
          </div>
          <div className="mb-1">
            <h2 className={styles.title}>ACCOUNT SETUP</h2>
            <p className="text-paragraph-14 text-text-1">
              Complete this quick survey to receive up to
              <span className="text-brand-1"> $101 </span>
              in promotional credits.
            </p>
            <p className="text-paragraph-12 text-text-3">
              *Includes $100 Sandbox credits and $1 Model API credits.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={styles.subtitle}>
                      <span className={styles.required}>*</span>
                      Name (required)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Input your name"
                        autoFocus={true}
                        onFocus={(e) => {
                          // Prevent automatic text selection
                          e.target.setSelectionRange(
                            e.target.value.length,
                            e.target.value.length,
                          );
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={styles.form_message} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className={styles.subtitle}>
                      <span className={styles.required}>*</span>
                      Company / Organization (required)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Input your company or organization name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={styles.form_message} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className={styles.subtitle}>Your role</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={field.value ? "" : styles.placeholder}
                        >
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleList.map((item, index) => (
                            <SelectItem key={index} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className={styles.form_message} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlySpend"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className={styles.subtitle}>
                      Current monthly spend on AI models and/or GPUs
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={field.value ? "" : styles.placeholder}
                        >
                          <SelectValue placeholder="Select a monthly spend" />
                        </SelectTrigger>
                        <SelectContent>
                          {spendList.map((item, index) => (
                            <SelectItem key={index} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className={styles.form_message} />
                  </FormItem>
                )}
              />

              <div className="flex flex-row justify-between mt-8 mb-1">
                <Button
                  variant="text"
                  className="ml-8"
                  size="lg"
                  type="button"
                  onClick={handleClose}
                >
                  Skip for now
                </Button>

                <Button
                  type="submit"
                  className="w-[200px]"
                  size="lg"
                  disabled={isSubmitting}
                  id={CLICK_BTN_IDs.MAIN_CONSOLE.QUESTIONNAIRE_SUBMIT}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
