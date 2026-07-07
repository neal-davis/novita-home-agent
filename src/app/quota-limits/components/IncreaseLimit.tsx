import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { message } from "@/components/ui/standard/notify";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { applyAdjustQuota } from "@/api/quota";
import { useAppSelector } from "@/store";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import styles from "./IncreaseLimit.module.scss";

const formSchema = z.object({
  requestedLimit: z
    .union([z.number(), z.string(), z.undefined()])
    .refine((val) => Number.isInteger(Number(val)) && Number(val) > 0, {
      message: "Please enter a positive integer value",
    }),
  reason: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email address"),
});

function IncreaseLimit({ quotaInfo }: { quotaInfo: Record<string, any> }) {
  const [open, setOpen] = useState(false);

  const uuid = useAppSelector((state) => state.user.uuid);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      contactEmail: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        requestedLimit: undefined,
        reason: "",
        contactEmail: "",
      });
    }
  }, [open, form]);

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setOpen(false);
      try {
        await applyAdjustQuota({
          uuid,
          quotaObject: quotaInfo?.quotaObject,
          quotaType: quotaInfo?.quotaType,
          currentLimit: quotaInfo?.currentQuota,
          requestLimit: values.requestedLimit as number,
          contactEmail: values.contactEmail,
          requestReason: values.reason as string,
        });
        message.info("Quota increase request submitted");
      } catch (error) {
        //
      }
    },
    [quotaInfo, uuid],
  );

  return (
    <div>
      <div
        className="p-0 !text-sm text-brand-1 cursor-pointer"
        onClick={() => {
          setOpen(true);
          analytics.trackClick(
            CLICK_BTN_IDs.QUOTA_LIMITS.INCREASE_LIMIT,
            quotaInfo,
          );
        }}
      >
        Increase Limit
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            width: 626,
            minWidth: 626,
          }}
          className="p-0"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Request Rate Limit Increase</DialogTitle>
          </DialogHeader>
          <div className={styles.content}>
            <div
              className={`${styles.quota_info} flex flex-row items-center justify-between`}
            >
              <div>
                <div className={styles.title}>Resource/Service</div>
                <div className={styles.value}>
                  {quotaInfo?.quotaObject || ""}
                </div>
              </div>
              <div className={styles.divider}></div>
              <div>
                <div className={styles.title}>Limit Metric</div>
                <div className={styles.value}>{quotaInfo?.quotaType || ""}</div>
              </div>
              <div className={styles.divider}></div>
              <div>
                <div className={styles.title}>Current Limit</div>
                <div className={styles.value}>
                  {quotaInfo?.currentQuota ?? ""}
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="pt-6">
                <FormField
                  control={form.control}
                  name="requestedLimit"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className={styles.form_title}>
                        <span className={styles.required}>*</span>
                        Requested Rate Limit
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.trim())
                          }
                        />
                      </FormControl>
                      <FormMessage className={styles.form_message} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className={styles.form_title}>
                        Reason for Request
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please enter the reason for your quota application to expedite our review process"
                        />
                      </FormControl>
                      <FormMessage className={styles.form_message} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className={styles.form_title}>
                        <span className={styles.required}>*</span>
                        Contact Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage className={styles.form_message} />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sl"
                    className="mr-4"
                    onClick={() => setOpen(false)}
                    id={CLICK_BTN_IDs.QUOTA_LIMITS.INCREASE_LIMIT_CANCEL}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ width: 160 }}
                    type="submit"
                    variant="secondary"
                    size="sl"
                    id={CLICK_BTN_IDs.QUOTA_LIMITS.INCREASE_LIMIT_SUBMIT}
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default IncreaseLimit;
