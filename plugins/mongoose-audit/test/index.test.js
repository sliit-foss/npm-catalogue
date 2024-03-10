import { default as mongoose } from "mongoose";
import { plugin, Audit } from "../src";
import { AuditType } from "../src/constants";

const connectToDatabase = async () => {
  await mongoose.connect("mongodb://localhost:27017/test")
};

const createTestModel = () => {
  const testSchema = new mongoose.Schema(
    {
      name: String,
      number: Number,
      date: {
        type: Date,
        default: Date.now()
      },
      empty: String,
      child: {
        name: String,
        number: Number
      },
      entity: {
        _id: String,
        id: String,
        name: String,
        array: []
      }
    },
    { timestamps: true }
  );
  testSchema.plugin(plugin, { background: false });
  return mongoose.model("Test", testSchema);
};

const TestObject = createTestModel();

const cleanup = async () => {
  await Promise.all([
    mongoose.connection.collections[TestObject.collection.collectionName].drop(),
    mongoose.connection.collections[Audit.collection.collectionName].drop()
  ]).catch(() => { });
}

beforeAll(connectToDatabase);

describe("audit", function () {

  afterEach(cleanup);

  const auditUser = "Jack";

  let test;

  beforeEach(async () => {
    test = new TestObject({ name: "Lucky", number: 7 });
    await test.save()
  });

  it("should create values for newly created entity", async () => {
    await Audit.find({ entity_id: test._id }).then((audit) => {
      expect(audit.length).toBe(1);
      const entry = audit[0];
      expect(entry.changes["name"].to).toBe("Lucky");
      expect(entry.changes["name"].type).toBe(AuditType.Add);
      expect(entry.user).toBe("Unknown User")
      expect(entry.entity).toBe("Test")
    })
  });

  it("should create values for changes on siblings (non-entities)", async () => {
    const expectedName = "test";
    const expectedNumber = 123;
    test.child = { name: expectedName, number: expectedNumber };
    test.__user = auditUser;
    await test.save().then(async () => {
      await Audit.find({ entity_id: test._id }).then((audit) => {
        expect(audit.length).toBe(2);
        const entry = audit[1];
        expect(entry.changes.child.name.to).toBe(expectedName);
        expect(entry.changes.child.name.type).toBe(AuditType.Add);
        expect(entry.changes.child.number.to).toBe(expectedNumber);
        expect(entry.changes.child.number.type).toBe(AuditType.Add);
      })
    });
  });

  it("should create single values for changes of siblings (non-entities) on remove", async () => {
    const expectedName = "test";
    const expectedNumber = 123;
    test.child = { name: expectedName, number: expectedNumber };
    test.__user = auditUser;
    await test.save().then(async (result) => {
      result.child = undefined;
      result.__user = auditUser;
      return result.save().then(async () => {
        const audit = await Audit.find({ entity_id: test._id })
        expect(audit.length).toBe(3);
        const entry = audit[2];
        expect(entry.changes.child.name.from).toBe(expectedName);
        expect(entry.changes.child.name.to).toBe(undefined);
        expect(entry.changes.child.name.type).toBe(AuditType.Delete);
        expect(entry.changes.child.number.from).toBe(expectedNumber);
        expect(entry.changes.child.number.to).toBe(undefined);
        expect(entry.changes.child.number.type).toBe(AuditType.Delete);
      }
      );
    });
  });

  it('should create type "Add" for adding values to arrays', async () => {
    const expectedValues = ["1", "2", "X"];
    test.entity = { array: [].concat(expectedValues) };
    test.__user = auditUser;
    await test.save().then(async () => {
      const audit = await Audit.find({ entity_id: test._id })
      expect(audit.length).toBe(2);
      const entry = audit[1];
      expect(entry.changes.entity.array.from.length).toBe(0);
      expect(entry.changes.entity.array.to).toEqual(expectedValues)
      expect(entry.changes.entity.array.type).toBe(AuditType.Add);
    });
  });

  it('should create type "Edit" for adding values on arrays', async () => {
    const previousValues = ["1", "2", "X"];
    const expectedValues = previousValues.concat(["Y"]);
    test.entity = { array: [].concat(previousValues) };
    test.__user = auditUser;
    await test.save().then(async (filled) => {
      filled.entity.array = [].concat(expectedValues);
      filled.__user = auditUser;
      await filled.save().then(async () => {
        const audit = await Audit.find({ entity_id: test._id })
        expect(audit.length).toBe(3);
        const entry = audit[2];
        expect(entry.changes.entity.array.from).toEqual(previousValues);
        expect(entry.changes.entity.array.to).toEqual(expectedValues);
        expect(entry.changes.entity.array.type).toBe(AuditType.Edit);
      });
    });
  });

  it('should create type "Edit" for removing values on arrays', async () => {
    const previousValues = ["1", "2", "X"];
    const expectedValues = ["1", "X"];
    test.entity = { array: [].concat(previousValues) };
    test.__user = auditUser;
    await test.save().then(async (filled) => {
      filled.entity.array = [].concat(expectedValues);
      filled.__user = auditUser;
      await filled.save().then(async () => {
        const audit = await Audit.find({ entity_id: test._id })
        expect(audit.length).toBe(3);
        const entry = audit[2];
        expect(entry.changes.entity.array.from).toEqual(previousValues);
        expect(entry.changes.entity.array.to).toEqual(expectedValues);
        expect(entry.changes.entity.array.type).toBe(AuditType.Edit);
      });
    });
  });

  it('should create type "Delete" for removing all values from arrays', async () => {
    const previousValues = ["1", "2", "X"];
    const expectedValues = [];
    test.entity = { array: [].concat(previousValues) };
    test.__user = auditUser;
    await test.save().then(async (filled) => {
      filled.entity.array = [].concat(expectedValues);
      filled.__user = auditUser;
      await filled.save().then(async () => {
        const audit = await Audit.find({ entity_id: test._id })
        expect(audit.length).toBe(3);
        const entry = audit[2];
        expect(entry.changes.entity.array.from).toEqual(previousValues);
        expect(entry.changes.entity.array.to).toEqual(expectedValues);
        expect(entry.changes.entity.array.type).toBe(AuditType.Delete);
      });
    });
  });

  it('should create type "Add" for new values', async () => {
    test.empty = "test";
    test.__user = auditUser;
    await test.save().then(async () => {
      const audit = await Audit.find({ entity_id: test._id })
      expect(audit.length).toBe(2);
      expect(audit[1].changes.empty.type).toBe(AuditType.Add);
    });
  });

  it('should create type "Delete" when value is being removed', async () => {
    test.name = undefined;
    test.__user = auditUser;
    await test.save().then(async () => {
      const audit = await Audit.find({ entity_id: test._id })
      expect(audit.length).toBe(2);
      expect(audit[1].changes.name.type).toBe("Delete");
    });
  });

  it("should not create audit trail if nothing changed", async () => {
    test.__user = auditUser;
    await test.save().then(async () => {
      const audit = await Audit.find({ entity_id: test._id });
      expect(audit.length).toBe(1);
      const items = await TestObject.find({});
      expect(items.length).toBe(1);
      expect(items[0].number).toBe(test.number);
      expect(items[0].name).toBe(test.name);
    });
  });

  it("should not create audit trail if only change is updatedAt", async () => {
    test.__user = auditUser;
    test.updatedAt = Date.now();
    await test.save().then(async () => {
      const audit = await Audit.find({ entity_id: test._id });
      expect(audit.length).toBe(1);
      const items = await TestObject.find({});
      expect(items.length).toBe(1);
      expect(items[0].number).toBe(test.number);
      expect(items[0].name).toBe(test.name);
    });
  });

  describe("should create audit trail for update", () => {
    afterEach(cleanup);
    const expected = 123;
    const expector = async (updater) => {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      await test2
        .save()
        .then(updater)
        .then(async () => {
          const audit = await Audit.find({});
          expect(audit.length).toBe(4);
          expect(Object.values(audit[2].changes).length).toBe(1);
          expect([test.number, test2.number]).toContain(audit[2].changes.number.from);
          expect(audit[2].changes.number.to).toBe(expected);
          expect(audit[2].user).toBe(auditUser);
          expect(audit[2].entity).toBe(TestObject.modelName);
          expect(Object.values(audit[3].changes).length).toBe(1);
          expect(audit[3].changes.number.to).toBe(expected);
          expect(audit[3].user).toBe(auditUser);
          expect(audit[3].entity).toBe(TestObject.modelName);
          const items = await TestObject.find({});
          expect(items.length).toBe(2);
          expect(items[0].number).toBe(expected);
          expect(items[1].number).toBe(expected);
        })
    }
    it("on class", async () => {
      await expector(() => TestObject.update({}, { number: expected }, { __user: auditUser, multi: true }))
    });
    it("for updateMany", async () => {
      await expector(() => TestObject.updateMany({}, { number: expected }, { __user: auditUser }))
    });
  })

  it("should create audit trail for update only for first elem if not multi", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    const expected = 123;
    await test2
      .save()
      .then(() => TestObject.update({}, { number: expected }, { __user: auditUser, multi: false }))
      .then(async () => {
        const audit = await Audit.find({});
        expect(audit.length).toBe(3);
        expect(audit[0].entity_id.toString()).toBe(test._id.toString());
        expect(audit[1].entity_id.toString()).toBe(test2._id.toString());
        expect(audit[2].entity_id.toString()).toBe(test._id.toString());
        const items = await TestObject.find({});
        expect(items.length).toBe(2);
        expect(items[0].number).toBe(expected);
        expect(items[1].number).toBe(test2.number);
      })
  });

  it("should create audit trail for update on instance", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    const expected = 123;
    await test2
      .save()
      .then(() => test.update({ number: expected }, { __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({});
        expect(audit.length).toBe(3);
        expect(Object.values(audit[2].changes).length).toBe(1);
        expect(audit[2].entity_id.toString()).toBe(test._id.toString());
        expect(audit[2].changes.number.from).toBe(test.number);
        expect(audit[2].changes.number.to).toBe(expected);
        expect(audit[2].user).toBe(auditUser);
        expect(audit[2].entity).toBe(TestObject.modelName);
        const items = await TestObject.find({});
        expect(items.length).toBe(2);
        expect(items[0].number).toBe(expected);
        expect(items[1].number).toBe(test2.number);
      })
  });

  it("should create audit trail on update with $set", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    const expected = 123;
    await test2
      .save()
      .then(() => TestObject.update({}, { $set: { number: expected } }, { __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({});
        expect(audit.length).toBe(3);
        expect(audit[2].entity_id.toString()).toBe(test._id.toString());
        const items = await TestObject.find({});
        expect(items.length).toBe(2);
        expect(items[0].number).toBe(expected);
        expect(items[1].number).toBe(test2.number);
      })
  });

  it("should create audit trail on update with $set if multi", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    const expected = 123;
    await test2
      .save()
      .then(() => TestObject.update({}, { $set: { number: expected } }, { multi: true, __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({});
        expect(audit.length).toBe(4);
        const items = await TestObject.find({});
        expect(items.length).toBe(2);
        expect(items[0].number).toBe(expected);
        expect(items[1].number).toBe(expected);
      })
  });

  it("should create audit trail on updateOne", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    const expected = 123;
    await test2
      .save()
      .then(() => TestObject.updateOne({ _id: test._id }, { number: expected }, { __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({});
        expect(audit.length).toBe(3);
        expect(Object.values(audit[2].changes).length).toBe(1);
        expect(audit[2].entity_id.toString()).toBe(test._id.toString());
        expect(audit[2].changes.number.from).toBe(test.number);
        expect(audit[2].changes.number.to).toBe(expected);
        expect(audit[2].user).toBe(auditUser);
        expect(audit[2].entity).toBe(TestObject.modelName);
        const items = await TestObject.find({});
        expect(items.length).toBe(2);
        expect(items[0].number).toBe(expected);
        expect(items[1].number).toBe(test2.number);
      })
  });

  it("should create audit trail on findOneAndUpdate", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    const expected = 123;
    await test2
      .save()
      .then(() => TestObject.findOneAndUpdate({ _id: test._id }, { number: expected }, { __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({});
        expect(audit.length).toBe(3);
        expect(Object.values(audit[2].changes).length).toBe(1);
        expect(audit[2].entity_id.toString()).toBe(test._id.toString());
        expect(audit[2].changes.number.from).toBe(test.number);
        expect(audit[2].changes.number.to).toBe(expected);
        expect(audit[2].user).toBe(auditUser);
        expect(audit[2].entity).toBe(TestObject.modelName);
        const items = await TestObject.find({});
        expect(items.length).toBe(2);
        expect(items[0].number).toBe(expected);
        expect(items[1].number).toBe(test2.number);
      })
  });

  it("should create audit trail on replaceOne", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    const expected = 123;
    const replace = Object.assign({}, test._doc);
    replace.number = expected;
    replace.__v += 1;
    await test2
      .save()
      .then(() => TestObject.replaceOne({ _id: test._id }, replace, { __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({});
        expect(audit.length).toBe(3);
        expect(Object.values(audit[2].changes).length).toBe(1);
        expect(audit[2].entity_id.toString()).toBe(test._id.toString());
        expect(audit[2].changes.number.from).toBe(test.number);
        expect(audit[2].changes.number.to).toBe(expected);
        expect(audit[2].user).toBe(auditUser);
        expect(audit[2].entity).toBe(TestObject.modelName);
        const items = await TestObject.find({});
        expect(items.length).toBe(2);
        expect(items[0].number).toBe(expected);
        expect(items[0].__v).toBe(1);
        expect(items[1].number).toBe(test2.number);
      })
  });

  const expectDeleteValues = (entry) => {
    expect(Object.values(entry.changes).length).toBe(4);
    expect(entry.entity_id.toString()).toBe(test._id.toString());
    expect(entry.changes.date.type).toBe(AuditType.Delete);
    expect(entry.changes.name.type).toBe(AuditType.Delete);
    expect(entry.changes.number.type).toBe(AuditType.Delete);
    expect(entry.changes.date.from).toBe(test.date.toISOString());
    expect(entry.changes.name.from).toBe(test.name);
    expect(entry.changes.number.from).toBe(test.number);
    expect(entry.user).toBe(auditUser);
    expect(entry.entity).toBe(TestObject.modelName);
  };

  it("should create audit trail on remove", async () => {
    await test
      .remove({ __user: auditUser })
      .then(async () => {
        const audit = await Audit.find({})
        expect(audit.length).toBe(2);
        expectDeleteValues(audit[1]);
        const items = await TestObject.find({});
        expect(items.length).toBe(0);
      });
  });

  it("should create audit trail on findOneAndRemove only for one item", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    await test2
      .save()
      .then(() => TestObject.findOneAndRemove({ _id: test._id }, { __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({})
        expect(audit.length).toBe(3);
        expectDeleteValues(audit[2]);
        const items = await TestObject.find({});
        expect(items.length).toBe(1);
        expect(items[0]._id.toString()).toBe(test2._id.toString());
      })
  });

  it("should create audit trail on findOneAndRemove only for one item", async () => {
    const test2 = new TestObject({ name: "Unlucky", number: 13 });
    await test2
      .save()
      .then(() => TestObject.findOneAndRemove({ _id: test._id }, { __user: auditUser }))
      .then(async () => {
        const audit = await Audit.find({})
        expect(audit.length).toBe(3);
        expectDeleteValues(audit[2]);
        const items = await TestObject.find({});
        expect(items.length).toBe(1);
        expect(items[0]._id.toString()).toBe(test2._id.toString());
      })
  });
});
