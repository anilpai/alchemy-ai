import * as CheckboxUI from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { ReactNode } from "react";

interface CheckboxProps {
  value: boolean;
  label: string;
  onValueChange: (tableName: string, value: boolean) => void;
}
const Checkbox = (props: CheckboxProps & { children?: ReactNode }) => {
  const { value, label, onValueChange, children } = props;
  return (
    <form>
      <div className="flex items-center justify-between px-1">
        <CheckboxUI.Root
          checked={value}
          onCheckedChange={(value: boolean) => onValueChange(label, value)}
          className="flex w-5 h-5 m-auto bg-white border border-gray-300 rounded-sm cursor-pointer shrink-0 hover:border-black"
          id={label}
        >
          <CheckboxUI.Indicator className="m-auto text-black">
            <CheckIcon />
          </CheckboxUI.Indicator>
        </CheckboxUI.Root>
        <label className="px-2 py-1 m-auto text-black truncate cursor-pointer Label grow dark:text-gray-300" htmlFor={label}>
          {label}
        </label>
        {children}
      </div>
    </form>
  );
};

export default Checkbox;
