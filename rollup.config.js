const files = ["index", "dice", "treasure"];

export default files.map((file) => ({
  input: `src/${file}.js`,
  output: {
    file: `${file}.js`,
    format: "iife",
  },
}));
