import { Modes, Segments, z, zelebrate, ZelebrateError } from "../src";

const next = jest.fn();

describe("test zelebrate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("body", () => {
    test("should parse succesfully", async () => {
      const m = zelebrate({
        [Segments.BODY]: z.object({
          name: z.string(),
          age: z.number()
        })
      }) as any;
      const req = {
        method: "POST",
        body: {
          name: "John",
          age: 30
        }
      };
      await m(req, {}, next);
      expect(req.body).toEqual({ name: "John", age: 30 });
      expect(next).toHaveBeenCalledWith(undefined);
    });
    test("should throw error", async () => {
      const m = zelebrate({
        [Segments.BODY]: z.object({
          name: z.string(),
          age: z.number()
        })
      }) as any;
      const req = {
        method: "POST",
        body: {
          name: "John",
          age: "King"
        }
      };
      await m(req, {}, next);
      expect(next).toHaveBeenCalled();

      const error: ZelebrateError = next.mock.calls[0][0];

      expect(error).toBeInstanceOf(ZelebrateError);
      expect(error.message).toEqual("Validation failed");

      const bodyDetails = error.details.get(Segments.BODY);

      expect(bodyDetails).toBeDefined();

      expect(bodyDetails.issues).toHaveLength(1);
      expect(bodyDetails.issues[0].code).toEqual("invalid_type");
      expect(bodyDetails.issues[0].path).toEqual(["age"]);
      expect(bodyDetails.issues[0].message).toEqual("Expected number, received string");
    });
    test("should do nothing if no body", async () => {
      const m = zelebrate({
        [Segments.BODY]: z.object({
          name: z.string(),
          age: z.number()
        })
      }) as any;
      const req = {
        method: "GET",
        body: {}
      } as any;
      await m(req, {}, next);
      expect(req.body).toEqual({});
      expect(next).toHaveBeenCalledWith(undefined);
    });
  });
  test("should try and parse multiple segments", async () => {
    const m = zelebrate(
      {
        [Segments.BODY]: z.object({
          name: z.string(),
          age: z.number()
        }),
        [Segments.QUERY]: z.object({
          id: z.coerce.number()
        })
      },
      { mode: Modes.FULL }
    ) as any;
    const req = {
      method: "POST",
      body: {
        name: "John",
        age: 30
      },
      query: {
        id: "123"
      }
    };
    await m(req, {}, next);
    expect(req.body).toEqual({ name: "John", age: 30 });
    expect(req.query).toEqual({ id: 123 });
    expect(next).toHaveBeenCalledWith(undefined);
  });
});
