import { generator } from "./utils/index";

const templates = [
  {
    name: "Express microservice",
    path: "express-microservice",
  },
];

export default function (plop) {
  return generator(plop, templates);
}
