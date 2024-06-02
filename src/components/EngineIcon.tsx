import { Engine } from "@/types";

interface Props {
  className: string;
  engine: Engine;
}

const EngineIcon = (props: Props) => {
  const { className } = props;
  return <img src="/db-postgres.png" className={className} alt="postgres" />;
};

export default EngineIcon;
