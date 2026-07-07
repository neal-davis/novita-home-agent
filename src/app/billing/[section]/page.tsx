import BillingPageContent from "../BillingPageContent";

export default async function BillingSection(props: {
  params: { section: string };
}) {
  const { section } = props.params;
  return <BillingPageContent section={section} />;
}
