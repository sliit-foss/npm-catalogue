export const basicFilterReq = {
  query: {
    filter: {
      name: "eq(John)",
      lastName: "ne(Doe)",
      middleName: "reg(.*Nathan.*)",
      age: "gt(20)",
      email: "nin(email1,email2,email3)",
      address: "in(address1,address2,address3)",
      weight: "gte(50)",
      height: "lt(180)",
      birthdate: "lte(2000-01-01)",
      isAlive: "exists(true)",
      isVerified: "eq(true)",
      isDeleted: "false"
    }
  }
};

export const basicFilterResult = {
  name: { $eq: "John" },
  lastName: { $ne: "Doe" },
  middleName: { $regex: /.*Nathan.*/ },
  age: { $gt: 20 },
  email: { $nin: ["email1", "email2", "email3"] },
  address: { $in: ["address1", "address2", "address3"] },
  weight: { $gte: 50 },
  height: { $lt: 180 },
  birthdate: { $lte: new Date("2000-01-01") },
  isAlive: { $exists: true },
  isVerified: { $eq: true },
  isDeleted: false
};

export const complexFilterReq = {
  query: {
    filter: {
      name: "and(eq(John),ne(Doe))",
      lastName: "or(eq(Doe),ne(John))"
    }
  }
};

export const complexFilterResult = {
  $and: [{ name: { $eq: "John" } }, { name: { $ne: "Doe" } }],
  $or: [{ lastName: { $eq: "Doe" } }, { lastName: { $ne: "John" } }]
};

export const complexRootKeyFilterReq = {
  query: {
    filter: {
      or: "firstName=eq(John),lastName=eq(Doe)",
      and: "age=gt(20),firstName=eq(John)"
    }
  }
};

export const complexRootKeyFilterResult = {
  $or: [{ firstName: { $eq: "John" } }, { lastName: { $eq: "Doe" } }],
  $and: [{ age: { $gt: 20 } }, { firstName: { $eq: "John" } }]
};

export const sortsReq: Record<string, any> = {
  query: {
    sort: {
      name: "1",
      lastName: "-1",
      weight: "asc",
      height: "desc"
    }
  }
};

export const sortResult = {
  name: 1,
  lastName: -1,
  weight: "asc",
  height: "desc"
};

export const includeReq = {
  query: {
    include: "posts,comments"
  }
};

export const includeResult = ["posts", "comments"];

export const selectReq = {
  query: {
    select: "first_name,last_name"
  }
};

export const selectResult = "first_name last_name";

export const req: Record<string, any> = {
  query: {
    filter: {
      name: "Aka"
    }
  }
};
