type FeatureType = "debug" | "collect";

export const usingDb = () => {
  return process.env.NEXT_PUBLIC_USE_DATABASE == "true";
};

const matrix: { [key: string]: { [feature: string]: boolean } } = {
  development: {
    debug: true,
    collect: usingDb(),
  },
  production: {
    debug: false,
    collect: usingDb(),
  },
};

export const hasFeature = (feature: FeatureType) => {
  return matrix[process.env.NODE_ENV][feature];
};
