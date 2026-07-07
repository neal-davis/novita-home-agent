import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LabelInput } from "@/app/user/components/label-input";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  queryEnterprisePlanSubmission,
  submissionEnterprisePlan,
} from "@/api/enterprise";
import { notify } from "@/components/ui/standard/notify";
export function SubmissionDialog({
  open,
  setOpen,
  plan_id,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  plan_id: number | string;
}) {
  const [form, setForm] = useState({
    email: "",
    plan_id: "",
    case: "",
    company_size: "",
  });

  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (value: boolean) => {
    console.log("Dialog state changed", value);
    setOpen(value);
  };

  const queryConfig = useCallback(() => {
    queryEnterprisePlanSubmission().then((res) => {
      setForm({
        email: res.email,
        company_size: res.company_size,
        case: res.case,
        plan_id: res.plan_id,
      });
      setIsPending(res.status === "Pending");
    });
  }, []);

  const handleSubmit = () => {
    submissionEnterprisePlan({
      ...form,
      plan_id,
    }).then(() => {
      queryConfig();
      notify.success("Apply submitted", {
        description: "Our team will reach out to you as soon as possible.",
      });
    });
  };

  useEffect(() => {
    queryConfig();
  }, [queryConfig]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Contact Dedicated Endpoints Sales</DialogTitle>
          <DialogDescription>
            Fill your details below to discuss the benefits of an Dedicated
            Endpoints
          </DialogDescription>
          <div className="py-6 flex flex-col gap-4">
            <LabelInput
              label="Email Address"
              name="email"
              value={form.email}
              onChange={(v) => {
                setForm((pre) => ({ ...pre, email: v }));
              }}
              disabled={isPending}
            />
            <LabelInput
              label="Company Size"
              name="company_size"
              value={form.company_size}
              onChange={(v) => {
                setForm((pre) => ({ ...pre, company_size: v }));
              }}
              disabled={isPending}
            />
            <div>
              <Label className="leading-[20px] text-sm font-normal text-common-dark-1">
                More
              </Label>
              <Textarea
                placeholder="Let us know which APIs and models you require."
                maxLength={3000}
                disabled={isPending}
              />
            </div>
          </div>
        </DialogHeader>

        {isPending && (
          <div className="max-w-2/3">
            <div className="text-primary text-sm">
              Your request has been received. Our team will reach out to you as
              soon as possible.
            </div>
          </div>
        )}

        {!isPending && (
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={(!form.email && !form.company_size) || isPending}
            >
              Submit
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
