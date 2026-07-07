"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import Link from "next/link";
import { useForm } from "react-hook-form";
import styles from "./HFTokenIntegrationModal.module.scss";

interface FormData {
  token: string;
}

interface HFTokenIntegrationModalProps {
  show: boolean;
  onClose: () => void;
  onTokenChange: (token: string) => void;
}

export default function HFTokenIntegrationModal({
  show,
  onClose,
  onTokenChange,
}: HFTokenIntegrationModalProps) {
  const form = useForm<FormData>({
    defaultValues: {
      token: "",
    },
  });

  const handleSubmit = async (values: FormData) => {
    try {
      onTokenChange(values.token);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent
        className={styles.modal_content}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <h2 className={styles.title}>Submit requirements</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <p className={styles.tips}>
              To connect your Hugging Face account, you need to register your
              Hugging Face access token. You can generate an access token on
              Hugging Face by following
              <Link
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                this link
              </Link>
            </p>
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={styles.subtitle}>
                    Hugging Face access token
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your Hugging Face access token"
                      className="h-[36px]"
                      autoFocus={true}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-8 mb-1">
              <Button
                type="button"
                variant="outline"
                className="w-[90px]"
                size="sl"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sl"
                className="w-[90px]"
                variant="secondary"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
