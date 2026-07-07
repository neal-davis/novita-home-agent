import ApplyPopover from "@/app/components/ApplyPopover";
import { getEndpointSpecs } from "@/api/gpu-instance/serverless";
import styles from "./Price.module.scss";
export default async function Price({ copy }: { copy?: unknown }) {
  let products: any[] = [];
  try {
    products = await getEndpointSpecs({ "pagination.page_size": 100 });
    console.log("products in price:", products);
  } catch {
    //
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.bg}>
        <div className="max_width_container">
          <h2 className={styles.title}>{"Pay-as-you-go, Save Costs"}</h2>
          <p className={styles.description}>
            {
              "Cost-effective pricing by the second. Detailed billing helps you understand your usage and manage costs efficiently."
            }
          </p>
          <div className={styles.table_box}>
            <table>
              <thead>
                <tr>
                  <th>{"Price per card"}</th>
                  <th>{"By the second"}</th>
                  <th>{"By the hour"}</th>
                </tr>
              </thead>
              <tbody>
                {(products || []).map(
                  (record: Record<string, string | number>, index: number) => {
                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? styles.stripe_row : ""}
                      >
                        <td>{record.gpu_name}</td>
                        <td>{`${"$"}${record.discount}`}</td>
                        <td>{`${"$"}${Math.round(Number(record.discount || 0) * 3600 * 10000) / 10000}`}</td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-row justify-center">
            <ApplyPopover
              buttonText={"Start Now"}
              applyTips={
                "Discord and contact the salesperson, activate the trial qualification, get a large trial fee"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
