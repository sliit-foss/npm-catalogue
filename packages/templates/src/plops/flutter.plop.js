import { generator } from "./utils/index.js";

const templates = [
  {
    name: "Cat Facts",
    path: "cat-facts",
  },
];

export default function (plop) {
  return generator(plop, templates);
}
