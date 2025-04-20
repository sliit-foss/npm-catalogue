import { Request } from "express";
import { Between, ILike, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from "typeorm";

export const basicFilterReq = {
  query: {
    filter: {
      name: "eq(John)",
      lastName: "ne(Doe)",
      middleName: "like(Nathan)",
      familyName: "ilike(O'Connor)",
      age: "gt(20)",
      email: "nin(email1,email2,email3)",
      address: "in(address1,address2,address3)",
      weight: "gte(50)",
      height: "lt(180)",
      birthdate: "lte(2000-01-01)",
      isAlive: "exists(true)",
      isVerified: "eq(true)",
      isSuspended: "ne(false)",
      isDeleted: "false",
      spouse: "exists(false)",
      followersCount: "between(10,100)"
    },
    page: "1",
    limit: "8"
  }
};

export const basicFilterResult = {
  name: "John",
  lastName: Not("Doe"),
  middleName: Like("%Nathan%"),
  familyName: ILike("%O'Connor%"),
  age: MoreThan(20),
  email: Not(In(["email1", "email2", "email3"])),
  address: In(["address1", "address2", "address3"]),
  weight: MoreThanOrEqual(50),
  height: LessThan(180),
  birthdate: LessThanOrEqual(new Date("2000-01-01")),
  isAlive: Not(IsNull()),
  isVerified: true,
  isSuspended: Not(false),
  isDeleted: false,
  spouse: IsNull(),
  followersCount: Between(10, 100)
};

export const complexRootKeyFilterReq = {
  query: {
    filter: {
      or: "firstName=eq(John),lastName=eq(Doe)"
    }
  }
};

export const complexRootKeyFilterResult = [{ firstName: "John" }, { lastName: "Doe" }];

export const sortsReq: Partial<Request<any, any, any, Record<string, any>>> = {
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
  weight: 1,
  height: -1
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

export const selectResult = ["first_name", "last_name"];

export const req: Partial<Request<any, any, any, Record<string, any>>> = {
  query: {
    filter: {
      name: "Aka"
    }
  }
};
