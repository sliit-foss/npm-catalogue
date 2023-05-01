import { generator } from "./utils/index.js";

const templates = [
  {
    name: "Cat facts",
    path: "cat-facts",
  },
];

export default function (plop) {
  return generator(plop, templates);
}
