import { initializeApp } from "firebase/app";
import { firestoreService, databaseService } from "../src";

export const initializeFirebase = () => {
  const firebaseConfig =
    typeof window !== "undefined"
      ? JSON.parse(atob(process.env.FIREBASE_CONFIG))
      : JSON.parse(
          Buffer.from(process.env.FIREBASE_CONFIG, "base64").toString()
        );
  return initializeApp(firebaseConfig);
};

const dataToFill = [
  { name: "Akalanka", age: 19 },
  { name: "Nimal", age: 20 },
  { name: "Saman", age: 21 },
  { name: "Samantha", age: 50, school: "Ananda" },
  { name: "Gimhan", age: 51, school: "Lyceum" },
  { name: "Lakshan", age: 23, height: 5.5 },
  { name: "Kasun", age: 23, weight: 80 },
  { name: "Bandu", age: 19, weight: 60, height: 6.0 },
  { name: "Kavindu", age: 19, weight: 60, height: 7.1 },
  { name: "Himash", age: 19, weight: 50, height: 5.2 },
];

export const fillFirestore = async () => {
  await Promise.all(
    dataToFill.map(async (user) => {
      await firestoreService.write({ collection: "users", payload: user });
    })
  );
};

export const resetFirestore = async () => {
  await firestoreService.remove({ collection: "users" });
};

export const fillDatabase = async () => {
  await Promise.all(
    data.map(async (user) => {
      databaseService.write({ path: "users", payload: user });
    })
  );
};

export const resetDatabase = async () => {
  databaseService.remove({ path: "users" });
};

export default {
  initializeFirebase,
  fillFirestore,
  resetFirestore,
  fillDatabase,
  resetDatabase,
};
