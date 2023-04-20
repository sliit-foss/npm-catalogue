import { generator } from "./utils";

const templates = [
  {
    name: "Cat Facts",
    path: "cat-facts",
  },
];

export default function (plop) {
  return generator(plop, templates);
}
