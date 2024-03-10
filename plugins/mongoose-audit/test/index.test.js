import { default as mongoose } from "mongoose";
import { exec } from "child_process";
import { promisify } from "util";
import { plugin, Audit } from "../src";
import { AuditType } from "../src/constants";

const execute = promisify(exec);

const setupMongoServer = async (done) => {
  await execute("docker run -d -p 27017:27017 --name audit-test mongo:4.2.8");
  mongoose.connect("mongodb://localhost:27018/audit-test", { useNewUrlParser: true }).then(done).catch(done);
};

const createTestModel = (getUser) => {
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
  testSchema.plugin(plugin, getUser);
  return mongoose.model("tests", testSchema);
};

describe("audit", function () {
  before(setupMongoServer);
  afterEach(function (done) {
    Promise.all([
      mongoose.connection.collections[TestObject.collection.collectionName].drop(),
      mongoose.connection.collections[Audit.collection.collectionName].drop()
    ])
      .then(() => done())
      .catch((err) => done(err.code !== 26 && err));
  });

  const TestObject = createTestModel();

  it("should return undefined on getUser", function () {
    expect(plugin.getUser()).to.be.undefined();
  });

  describe("plugin: pre *", function () {
    const auditUser = "Jack";

    let test;
    beforeEach((done) => {
      test = new TestObject({ name: "Lucky", number: 7 });
      test
        .save()
        .then(() => done())
        .catch(done);
    });

    it("should create single values for changes on siblings (non-entities)", function () {
      const expectedName = "test";
      const expectedNumber = 123;
      test.child = { name: expectedName, number: expectedNumber };
      test.__user = auditUser;
      return test.save().then(() =>
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(1);
          const entry = audit[0];
          expect(entry.changes["child.name"].to).equal(expectedName);
          expect(entry.changes["child.name"].type).equal(AuditType.Add);
          expect(entry.changes["child.number"].to).equal(expectedNumber);
          expect(entry.changes["child.number"].type).equal(AuditType.Add);
        })
      );
    });

    it("should create single values for changes of siblings (non-entities) on remove", function () {
      const expectedName = "test";
      const expectedNumber = 123;
      test.child = { name: expectedName, number: expectedNumber };
      test.__user = auditUser;
      return test.save().then((result) => {
        result.child = undefined;
        result.__user = auditUser;
        return result.save().then(() =>
          Audit.find({ entity_id: test._id }, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            const entry = audit[1];
            expect(entry.changes["child.name"].from).equal(expectedName);
            expect(entry.changes["child.name"].to).to.be.undefined();
            expect(entry.changes["child.name"].type).equal(AuditType.Delete);
            expect(entry.changes["child.number"].from).equal(expectedNumber);
            expect(entry.changes["child.number"].to).to.be.undefined();
            expect(entry.changes["child.number"].type).equal(AuditType.Delete);
          })
        );
      });
    });

    it('should create combined value for changes on entities (with "_id"-field)', function () {
      const expectedId = "123";
      const expectedName = "test";
      test.entity = { name: expectedName, _id: expectedId };
      test.__user = auditUser;
      return test.save().then(() =>
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(1);
          const entry = audit[0];
          expect(entry.changes["entity._id"].to).equal(expectedId);
          expect(entry.changes["entity.name"].to).equal(expectedName);
          expect(entry.changes["entity._id"].type).equal(AuditType.Add);
          expect(entry.changes["entity.name"].type).equal(AuditType.Add);
        })
      );
    });

    it('should create combined value for changes on entities (with "id"-field)', function () {
      const expectedId = "123";
      const expectedName = "test";
      test.entity = { name: expectedName, id: expectedId };
      test.__user = auditUser;
      return test.save().then(() =>
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(1);
          const entry = audit[0];
          expect(entry.changes["entity.id"].to).equal(expectedId);
          expect(entry.changes["entity.name"].to).equal(expectedName);
          expect(entry.changes["entity.id"].type).equal(AuditType.Add);
          expect(entry.changes["entity.name"].type).equal(AuditType.Add);
        })
      );
    });

    it('should create combined value for changes of entities (with "_id"-field) on remove', function () {
      const expectedId = "123";
      const expectedName = "test";
      test.entity = { name: expectedName, _id: expectedId };
      test.__user = auditUser;
      return test.save().then((result) => {
        result.entity = undefined;
        result.__user = auditUser;
        return result.save().then(() =>
          Audit.find({ entity_id: test._id }, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            const entry = audit[1];
            expect(entry.changes.entity.from._id).equal(expectedId);
            expect(entry.changes.entity.from.name).equal(expectedName);
            expect(entry.changes.entity.to).to.be.undefined();
            expect(entry.changes.entity.type).equal(AuditType.Delete);
          })
        );
      });
    });

    it('should create combined value for changes of entities (with "id"-field) on remove', function () {
      const expectedId = "123";
      const expectedName = "test";
      test.entity = { name: expectedName, id: expectedId };
      test.__user = auditUser;
      return test.save().then((result) => {
        result.entity = undefined;
        result.__user = auditUser;
        return result.save().then(() =>
          Audit.find({ entity_id: test._id }, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            const entry = audit[1];
            expect(entry.changes.entity.from.id).equal(expectedId);
            expect(entry.changes.entity.from.name).equal(expectedName);
            expect(entry.changes.entity.to).to.be.undefined();
            expect(entry.changes.entity.type).equal("Delete");
          })
        );
      });
    });

    it('should create type "Add" for adding values to arrays', function () {
      const expectedValues = ["1", "2", "X"];
      test.entity = { array: [].concat(expectedValues) };
      test.__user = auditUser;
      return test.save().then(() =>
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(1);
          const entry = audit[0];
          expect(entry.changes["entity.array"].from.length).equal(0);
          expect(entry.changes["entity.array"].to).to.have.members(expectedValues);
          expect(entry.changes["entity.array"].type).equal("Add");
        })
      );
    });

    it('should create combined type "Edit" for adding values on arrays', function () {
      const previousValues = ["1", "2", "X"];
      const expectedValues = previousValues.concat(["Y"]);
      test.entity = { array: [].concat(previousValues) };
      test.__user = auditUser;
      return test.save().then((filled) => {
        filled.entity.array = [].concat(expectedValues);
        filled.__user = auditUser;
        return filled.save().then(() =>
          Audit.find({ entity_id: test._id }, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            const entry = audit[1];
            expect(entry.changes["entity.array"].from).to.have.members(previousValues);
            expect(entry.changes["entity.array"].to).to.have.members(expectedValues);
            expect(entry.changes["entity.array"].type).equal("Edit");
          })
        );
      });
    });

    it('should create combined type "Edit" for removing values on arrays', function () {
      const previousValues = ["1", "2", "X"];
      const expectedValues = ["1", "X"];
      test.entity = { array: [].concat(previousValues) };
      test.__user = auditUser;
      return test.save().then((filled) => {
        filled.entity.array = [].concat(expectedValues);
        filled.__user = auditUser;
        return filled.save().then(() =>
          Audit.find({ entity_id: test._id }, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            const entry = audit[1];
            expect(entry.changes["entity.array"].from).to.have.members(previousValues);
            expect(entry.changes["entity.array"].to).to.have.members(expectedValues);
            expect(entry.changes["entity.array"].type).equal("Edit");
          })
        );
      });
    });

    it('should create type "Delete" for removing all values from arrays', function () {
      const previousValues = ["1", "2", "X"];
      const expectedValues = [];
      test.entity = { array: [].concat(previousValues) };
      test.__user = auditUser;
      return test.save().then((filled) => {
        filled.entity.array = [].concat(expectedValues);
        filled.__user = auditUser;
        return filled.save().then(() =>
          Audit.find({ entity_id: test._id }, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            const entry = audit[1];
            expect(entry.changes["entity.array"].from).to.have.members(previousValues);
            expect(entry.changes["entity.array"].to).to.have.members(expectedValues);
            expect(entry.changes["entity.array"].type).equal("Delete");
          })
        );
      });
    });

    it('should create type "Add" for new values', function () {
      test.empty = "test";
      test.__user = auditUser;
      return test.save().then(() =>
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(1);
          expect(audit[0].changes.empty.type).equal("Add");
        })
      );
    });

    it('should create type "Delete" when value is being removed', function () {
      test.name = undefined;
      test.__user = auditUser;
      return test.save().then(() =>
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(1);
          expect(audit[0].changes.name.type).equal("Delete");
        })
      );
    });

    it("should create audit trail on save", function (done) {
      const expectedName = "Unlucky";
      const expectedNumber = 13;
      test.name = expectedName;
      test.number = expectedNumber;
      test.__user = auditUser;
      test.save().then(() => {
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(1);
          const entry = audit[0];
          expect(entry.entity_id.toString()).equal(test._id.toString());
          expect(Object.values(entry.changes).length).equal(2);
          expect(entry.changes.name.from).equal("Lucky");
          expect(entry.changes.name.to).equal(expectedName);
          expect(entry.changes.number.from).equal(7);
          expect(entry.changes.number.to).equal(expectedNumber);
          expect(entry.user).equal(auditUser);
          expect(entry.createdAt).not.null();
          expect(entry.createdAt).not.undefined();
          expect(entry.updatedAt).not.null();
          expect(entry.updatedAt).not.undefined();
          expect(entry.entity).equal(TestObject.modelName);
          TestObject.find({}, function (err, items) {
            expect(err).to.null();
            expect(items.length).equal(1);
            expect(items[0].number).equal(expectedNumber);
            expect(items[0].name).equal(expectedName);
            done();
          });
        });
      });
    });

    it("should not create audit trail if nothing changed", function (done) {
      test.__user = auditUser;
      test.save().then(() => {
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(0);
          TestObject.find({}, function (err, items) {
            expect(err).to.null();
            expect(items.length).equal(1);
            expect(items[0].number).equal(test.number);
            expect(items[0].name).equal(test.name);
            done();
          });
        });
      });
    });

    it("should not create audit trail if only change is updatedAt", function (done) {
      test.__user = auditUser;
      test.updatedAt = Date.now();
      test.save().then(() => {
        Audit.find({ entity_id: test._id }, function (err, audit) {
          expect(err).to.null();
          expect(audit.length).equal(0);
          TestObject.find({}, function (err, items) {
            expect(err).to.null();
            expect(items.length).equal(1);
            expect(items[0].number).equal(test.number);
            expect(items[0].name).equal(test.name);
            done();
          });
        });
      });
    });

    it("should create audit trail for update on class", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.update({}, { number: expected }, { __user: auditUser, multi: true }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            expect(Object.values(audit[0].changes).length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[0].changes.number.from).equal(test.number);
            expect(audit[0].changes.number.to).equal(expected);
            expect(audit[0].user).equal(auditUser);
            expect(audit[0].entity).equal(TestObject.modelName);
            expect(Object.values(audit[1].changes).length).equal(1);
            expect(audit[1].entity_id.toString()).equal(test2._id.toString());
            expect(audit[1].changes.number.from).equal(test2.number);
            expect(audit[1].changes.number.to).equal(expected);
            expect(audit[1].user).equal(auditUser);
            expect(audit[1].entity).equal(TestObject.modelName);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(expected);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail for updateMany", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.updateMany({}, { number: expected }, { __user: auditUser }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            expect(Object.values(audit[0].changes).length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[0].changes.number.from).equal(test.number);
            expect(audit[0].changes.number.to).equal(expected);
            expect(audit[0].user).equal(auditUser);
            expect(audit[0].entity).equal(TestObject.modelName);
            expect(Object.values(audit[1].changes).length).equal(1);
            expect(audit[1].entity_id.toString()).equal(test2._id.toString());
            expect(audit[1].changes.number.from).equal(test2.number);
            expect(audit[1].changes.number.to).equal(expected);
            expect(audit[1].user).equal(auditUser);
            expect(audit[1].entity).equal(TestObject.modelName);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(expected);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail for updateMany ignoring multi value", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.updateMany({}, { number: expected }, { __user: auditUser, multi: false }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[1].entity_id.toString()).equal(test2._id.toString());
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(expected);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail for update only for first elem if not multi", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.update({}, { number: expected }, { __user: auditUser, multi: false }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expect(Object.values(audit[0].changes).length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[0].changes.number.from).equal(test.number);
            expect(audit[0].changes.number.to).equal(expected);
            expect(audit[0].user).equal(auditUser);
            expect(audit[0].entity).equal(TestObject.modelName);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(test2.number);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail for update on instance", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => test.update({ number: expected }, { __user: auditUser }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expect(Object.values(audit[0].changes).length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[0].changes.number.from).equal(test.number);
            expect(audit[0].changes.number.to).equal(expected);
            expect(audit[0].user).equal(auditUser);
            expect(audit[0].entity).equal(TestObject.modelName);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(test2.number);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail on update with $set", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.update({}, { $set: { number: expected } }, { __user: auditUser }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(test2.number);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail on update with $set if multi", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.update({}, { $set: { number: expected } }, { multi: true, __user: auditUser }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(2);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[1].entity_id.toString()).equal(test2._id.toString());
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(expected);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail on updateOne", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.updateOne({ _id: test._id }, { number: expected }, { __user: auditUser }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expect(Object.values(audit[0].changes).length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[0].changes.number.from).equal(test.number);
            expect(audit[0].changes.number.to).equal(expected);
            expect(audit[0].user).equal(auditUser);
            expect(audit[0].entity).equal(TestObject.modelName);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(test2.number);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail on findOneAndUpdate", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      test2
        .save()
        .then(() => TestObject.findOneAndUpdate({ _id: test._id }, { number: expected }, { __user: auditUser }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expect(Object.values(audit[0].changes).length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[0].changes.number.from).equal(test.number);
            expect(audit[0].changes.number.to).equal(expected);
            expect(audit[0].user).equal(auditUser);
            expect(audit[0].entity).equal(TestObject.modelName);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[1].number).equal(test2.number);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should create audit trail on replaceOne", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      const expected = 123;
      const replace = Object.assign({}, test._doc);
      replace.number = expected;
      replace.__v += 1;
      test2
        .save()
        .then(() => TestObject.replaceOne({ _id: test._id }, replace, { __user: auditUser }))
        .then(() => {
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expect(Object.values(audit[0].changes).length).equal(1);
            expect(audit[0].entity_id.toString()).equal(test._id.toString());
            expect(audit[0].changes.number.from).equal(test.number);
            expect(audit[0].changes.number.to).equal(expected);
            expect(audit[0].user).equal(auditUser);
            expect(audit[0].entity).equal(TestObject.modelName);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(2);
              expect(items[0].number).equal(expected);
              expect(items[0].__v).equal(1);
              expect(items[1].number).equal(test2.number);
              done();
            });
          });
        })
        .catch(done);
    });

    const expectDeleteValues = (entry) => {
      expect(Object.values(entry.changes).length).equal(3);
      expect(entry.entity_id.toString()).equal(test._id.toString());
      expect(entry.changes.date.type).equal("Delete");
      expect(entry.changes.name.type).equal("Delete");
      expect(entry.changes.number.type).equal("Delete");
      expect(entry.changes.date.from).equal(test.date.toISOString());
      expect(entry.changes.name.from).equal(test.name);
      expect(entry.changes.number.from).equal(test.number);
      expect(entry.user).equal(auditUser);
      expect(entry.entity).equal(TestObject.modelName);
    };

    it("should create audit trail on remove", function (done) {
      test
        .remove({ __user: auditUser })
        .then(() =>
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expectDeleteValues(audit[0]);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(0);
              done();
            });
          })
        )
        .catch(done);
    });

    it("should create audit trail on findOneAndDelete", function (done) {
      TestObject.findOneAndDelete({ _id: test._id }, { __user: auditUser })
        .then(() =>
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expectDeleteValues(audit[0]);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(0);
              done();
            });
          })
        )
        .catch(done);
    });

    it("should create audit trail on findOneAndDelete only for one item", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      test2
        .save()
        .then(() => TestObject.findOneAndDelete({ _id: test._id }, { __user: auditUser }))
        .then(() =>
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expectDeleteValues(audit[0]);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(1);
              expect(items[0]._id.toString()).equal(test2._id.toString());
              done();
            });
          })
        )
        .catch(done);
    });

    it("should create audit trail on findOneAndRemove", function (done) {
      TestObject.findOneAndRemove({ _id: test._id }, { __user: auditUser })
        .then(() =>
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expectDeleteValues(audit[0]);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(0);
              done();
            });
          })
        )
        .catch(done);
    });

    it("should create audit trail on findOneAndRemove only for one item", function (done) {
      const test2 = new TestObject({ name: "Unlucky", number: 13 });
      test2
        .save()
        .then(() => TestObject.findOneAndRemove({ _id: test._id }, { __user: auditUser }))
        .then(() =>
          Audit.find({}, function (err, audit) {
            expect(err).to.null();
            expect(audit.length).equal(1);
            expectDeleteValues(audit[0]);
            TestObject.find({}, function (err, items) {
              expect(err).to.null();
              expect(items.length).equal(1);
              expect(items[0]._id.toString()).equal(test2._id.toString());
              done();
            });
          })
        )
        .catch(done);
    });
  });

  describe("plugin: user callback", function () {
    it("should use the user callback if provided", function (done) {
      const expectedUser = "User from function";
      plugin.getUser = () => expectedUser;

      const test = new TestObject({ name: "Lucky", number: 7 });
      test
        .save()
        .then((test) => {
          test.name = "Unlucky";
          test.number = 13;
          test.save().then(() => {
            Audit.find({ entity_id: test._id }, function (err, audit) {
              expect(err).to.null();
              expect(audit.length).equal(1);
              expect(audit[0].user).equal(expectedUser);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should use the user if provided", function (done) {
      const expectedUser = "User from parameter";
      plugin.getUser = () => expectedUser;

      const test = new TestObject({ name: "Lucky", number: 7 });
      test
        .save()
        .then((test) => {
          test.name = "Unlucky";
          test.number = 13;
          test.__user = "";
          test.save().then(() => {
            Audit.find({ entity_id: test._id }, function (err, audit) {
              expect(err).to.null();
              expect(audit.length).equal(1);
              expect(audit[0].user).equal(expectedUser);
              done();
            });
          });
        })
        .catch(done);
    });

    it("should throw error if no user is provided", function (done) {
      plugin.getUser = () => undefined;

      const test = new TestObject({ name: "Lucky", number: 7 });
      test
        .save()
        .then((test) => {
          test.name = "Unlucky";
          test.number = 13;
          test
            .save()
            .then((_) => done(new Error("should not have succeeded!")))
            .catch((err) => {
              expect(err.message).to.be.equal("User missing in audit log!");
              done();
            });
        })
        .catch(done);
    });
  });
});
