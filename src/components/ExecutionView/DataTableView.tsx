import { head } from "lodash-es";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import { RawResult } from "@/types";
import Icon from "../Icon";

interface Props {
  rawResults: RawResult[];
}

const DataTableView = (props: Props) => {
  const { rawResults } = props;
  const { t } = useTranslation();
  const columns = Object.keys(head(rawResults) || {}).map((key) => {
    return {
      name: key,
      sortable: true,
      selector: (row: any) => row[key],
    };
  });

  return rawResults.length === 0 ? (
    <div className="flex flex-col items-center justify-center w-full py-6 pt-10">
      <Icon.BsBox2 className="h-auto w-7 opacity-70" />
      <span className="mt-2 font-mono text-sm text-gray-500">{t("execution.message.no-data")}</span>
    </div>
  ) : (
    <DataTable
      className="w-full border !rounded-lg dark:border-zinc-700"
      columns={columns}
      data={rawResults}
      fixedHeader
      pagination
      responsive
    />
  );
};

export default DataTableView;
