import OverviewPage from "./overview";
import BillingTransactions from "./billing-transactions";
import BillingDetails from "./billing-details";
import BalanceWarning from "./balance-warning";
import BudgetsPage from "./budgets";
import CodingPlanPage from "./coding-plan";

type BillingPageContentProps = {
  section?: string;
};

export default function BillingPageContent(props: BillingPageContentProps) {
  const { section } = props;

  switch (section) {
    case "transactions": {
      return <BillingTransactions />;
    }
    case "details": {
      return <BillingDetails />;
    }
    case "coding-plan": {
      return <CodingPlanPage />;
    }
    case "balance-warning": {
      return <BalanceWarning />;
    }
    case "budgets": {
      return <BudgetsPage />;
    }
    default: {
      return <OverviewPage />;
    }
  }
}
