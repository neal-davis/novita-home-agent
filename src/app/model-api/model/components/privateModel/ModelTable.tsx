import { useCallback, useEffect, useState } from "react";
import styles from "./ModelTable.module.css";
import { message } from "@/components/ui/standard/notify";
import { delModel, getModel } from "@/api/user";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoData } from "@/components/ui/standard/no-data";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
const tagStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "none",
  color: "#000",
};
const tagSuccessStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "none",
  color: "#86DF6C",
};
export default function ModelTable({
  visible,
  copy,
}: {
  visible: boolean;
  copy: any;
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const keys = useSelectKeys();
  const [open, setOpen] = useState(false);
  const [selectData, setSelectData] = useState({
    selectModelId: -1,
    modelName: "",
  });
  const fetchModel = useCallback(
    (next: string) => {
      setLoading(true);
      getModel(keys[0] ?? "", {
        "pagination.limit": 50,
        "pagination.cursor": next,
        "filter.visibility": "private",
      })
        .then((res) => {
          setData(res.models);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [keys],
  );
  useEffect(() => {
    if (!visible) {
      fetchModel("c_0");
    }
  }, [fetchModel, visible]);
  return (
    <div className={styles.content}>
      <div className={styles.table_container}>
        <Table loading={loading}>
          {loading && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/50">
              <Loader2 size={40} className="animate-spin" />
            </div>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>{"ID"}</TableHead>
              <TableHead>{"Name"}</TableHead>
              <TableHead>{"MODEL NAME In API"}</TableHead>
              <TableHead>{"Type"}</TableHead>
              <TableHead>{"Base Model"}</TableHead>
              <TableHead>{"Base Model Type"}</TableHead>
              <TableHead>{"STATUS"}</TableHead>
              <TableHead>{"OPERATE"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <div style={{ whiteSpace: "normal" }}>{item.name}</div>
                </TableCell>
                <TableCell>
                  <div style={{ whiteSpace: "normal" }}>
                    {item.sd_name_in_api}
                  </div>
                </TableCell>
                <TableCell>
                  {item.type?.display_name || item.type?.name || ""}
                </TableCell>
                <TableCell>
                  <div
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "normal",
                      margin: "0 auto",
                    }}
                  >
                    {item.base_model}
                  </div>
                </TableCell>
                <TableCell>{item.base_model_type}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <span
                    className="inline-flex rounded px-2 py-0.5 text-xs"
                    style={item.status ? tagSuccessStyle : tagStyle}
                  >
                    {item.status ? "running" : "unavailable"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    style={{
                      fontSize: "12px",
                      padding: "0px 8px",
                      height: 30,
                    }}
                    onClick={() => {
                      setOpen(true);
                      setSelectData({
                        selectModelId: item.id,
                        modelName: item.name,
                      });
                    }}
                    id={CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_MGMT_DELETE_MODEL}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && !loading && (
          <div className="min-h-[300px] flex flex-col justify-center items-center">
            <NoData />
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {"Are you sure to delete model `" + selectData.modelName + "`?"}
            </DialogTitle>
          </DialogHeader>
          <div className="font-body">
            Warning: This action cannot be undone.
          </div>
          <DialogFooter>
            <Button
              variant="warn"
              onClick={() => {
                if (selectData.selectModelId < 0) {
                  message.error("Please select a model first!");
                  return;
                }
                delModel(keys[0] ?? "", selectData.selectModelId).then(() => {
                  message.success("Delete success!");
                  setOpen(false);
                  fetchModel("c_0");
                });
              }}
              id={CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_MGMT_DELETE_MODEL_CONFIRM}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
