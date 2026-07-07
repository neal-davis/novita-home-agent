import styles from "./Table.module.scss";
import { Skeleton as Skeleton } from "@/components/ui/skeleton";

export type TableColumn = {
  title: string;
  dataIndex: string;
  align?: "left" | "center" | "right";
  render?: (value: any, record: any) => React.ReactNode;
};

export type DataSource = {
  [key: string]: any;
};

export function Table({
  columns,
  data,
  rowKey,
  loading,
}: {
  columns: TableColumn[];
  data: DataSource[];
  rowKey: string;
  loading?: boolean;
}) {
  return (
    <div className={styles.table_wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => {
              return (
                <th key={column.dataIndex} style={{ textAlign: column.align }}>
                  {column.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  borderBottom: "none",
                }}
              >
                <div className={styles.loading}>
                  <Skeleton active />
                </div>
              </td>
            </tr>
          )}
          {!loading && data.length === 0 && (
            <tr className="!bg-white">
              <td
                colSpan={columns.length}
                style={{
                  borderBottom: "none",
                  textAlign: "center",
                }}
                className="!bg-white"
              >
                <div className={styles.loading}>
                  <img
                    src="/billing/table-empty.svg"
                    alt="no data"
                    style={{
                      opacity: 0.5,
                    }}
                  />
                  <p className="text-common-dark-3">No data</p>
                </div>
              </td>
            </tr>
          )}
          {!loading &&
            data.map((record) => {
              return (
                <tr key={record[rowKey]}>
                  {columns.map((column) => {
                    return (
                      <td
                        key={record[rowKey] + column.dataIndex}
                        style={{ textAlign: column.align }}
                      >
                        {column.render
                          ? column.render(record[column.dataIndex], record)
                          : record[column.dataIndex]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
