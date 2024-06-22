"use strict";

import { default as mongoose } from "mongoose";
import { exec } from "child_process";
import { promisify } from "util";
import mongooseAggregatePaginate from "../src";

jest.setTimeout(120000)

const execute = promisify(exec);

const AuthorSchema = new mongoose.Schema({
    name: String
});

const Author = mongoose.model("Author", AuthorSchema);

const BookSchema = new mongoose.Schema({
    title: String,
    date: Date,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author"
    }
});

BookSchema.plugin(mongooseAggregatePaginate);

const Book = mongoose.model("Book", BookSchema);

beforeAll(async () => {
    await execute("docker run -d -p 27017:27017 mongo:5.0")
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await mongoose.connect("mongodb://localhost:27017/test")
    await mongoose.connection.db.dropDatabase();
    let book, books = [];
    const date = new Date();
    return Author.create({
        name: "Arthur Conan Doyle"
    }).then(async function (author) {
        for (let i = 1; i <= 100; i++) {
            book = new Book({
                title: "Book #" + i,
                date: new Date(date.getTime() + i),
                author: author._id
            });
            books.push(book);
        }
        return Book.create(books);
    });
});

describe("mongoose-paginate", function () {
    it("promise return test", function () {
        var aggregate = Book.aggregate([
            {
                $match: {
                    title: {
                        $in: [/Book/i]
                    }
                }
            }
        ]);

        let promise = aggregate.paginateExec({});
        // let promise = Book.aggregatePaginate(aggregate, {});
        expect(promise.then).toBeInstanceOf(Function);
    });

    it("callback test", function (done) {
        var aggregate = Book.aggregate([
            {
                $match: {
                    title: {
                        $in: [/Book/i]
                    }
                }
            }
        ]);

        aggregate.paginateExec({}, function (err, result) {
            expect(err).toBeNull();
            expect(result).toBeInstanceOf(Object);
            done();
        });
    });

    it("count query test", function () {
        var query = {
            title: {
                $in: [/Book/i]
            }
        };
        var aggregate = Book.aggregate([
            {
                $match: query
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        var options = {
            limit: 10,
            page: 5,
            allowDiskUse: true,
            countQuery: Book.aggregate([
                {
                    $match: query
                }
            ])
        };
        return Book.aggregatePaginate(aggregate, options).then((result) => {
            expect(result.docs).toHaveLength(10);
            expect(result.docs[0].title).toEqual("Book #41");
            expect(result.totalDocs).toEqual(100);
            expect(result.limit).toEqual(10);
            expect(result.page).toEqual(5);
            expect(result.pagingCounter).toEqual(41);
            expect(result.hasPrevPage).toEqual(true);
            expect(result.hasNextPage).toEqual(true);
            expect(result.prevPage).toEqual(4);
            expect(result.nextPage).toEqual(6);
            expect(result.totalPages).toEqual(10);
        });
    });

    describe("paginates", function () {
        it("with global limit and page", function () {
            Book.aggregatePaginate.options = {
                limit: 20
            };

            var aggregate = Book.aggregate([
                {
                    $match: {
                        title: {
                            $in: [/Book/i]
                        }
                    }
                },
                {
                    $sort: {
                        date: 1
                    }
                }
            ]);
            var options = {
                limit: 10,
                page: 5,
                allowDiskUse: true
            };
            return Book.aggregatePaginate(aggregate, options).then((result) => {
                expect(result.docs).toHaveLength(10);
                expect(result.docs[0].title).toEqual("Book #41");
                expect(result.totalDocs).toEqual(100);
                expect(result.limit).toEqual(10);
                expect(result.page).toEqual(5);
                expect(result.pagingCounter).toEqual(41);
                expect(result.hasPrevPage).toEqual(true);
                expect(result.hasNextPage).toEqual(true);
                expect(result.prevPage).toEqual(4);
                expect(result.nextPage).toEqual(6);
                expect(result.totalPages).toEqual(10);
            });
        });

        it("with custom labels", function () {
            var aggregate = Book.aggregate([
                {
                    $match: {
                        title: {
                            $in: [/Book/i]
                        }
                    }
                },
                {
                    $sort: {
                        date: 1
                    }
                }
            ]);

            const myCustomLabels = {
                totalDocs: "itemCount",
                docs: "itemsList",
                limit: "perPage",
                page: "currentPage",
                hasNextPage: "hasNext",
                hasPrevPage: "hasPrev",
                nextPage: "next",
                prevPage: "prev",
                totalPages: "pageCount",
                pagingCounter: "pageCounter"
            };

            var options = {
                // limit: 10,
                page: 5,
                customLabels: myCustomLabels
            };
            return Book.aggregatePaginate(aggregate, options).then((result) => {
                expect(result.itemsList).toHaveLength(20);
                expect(result.itemsList[0].title).toEqual("Book #81");
                expect(result.itemCount).toEqual(100);
                expect(result.perPage).toEqual(20);
                expect(result.currentPage).toEqual(5);
                expect(result.pageCounter).toEqual(81);
                expect(result.hasPrev).toEqual(true);
                expect(result.hasNext).toEqual(false);
                expect(result.prev).toEqual(4);
                expect(result.next).toEqual(null);
                expect(result.pageCount).toEqual(5);
            });
        });

        it("with offset", function () {
            var aggregate = Book.aggregate([
                {
                    $match: {
                        title: {
                            $in: [/Book/i]
                        }
                    }
                },
                {
                    $sort: {
                        date: 1
                    }
                }
            ]);

            const myCustomLabels = {
                totalDocs: "itemCount",
                docs: "itemsList",
                limit: "perPage",
                page: "currentPage",
                hasNextPage: "hasNext",
                hasPrevPage: "hasPrev",
                nextPage: "next",
                prevPage: "prev",
                totalPages: "pageCount",
                pagingCounter: "pageCounter"
            };

            var options = {
                // limit: 10,
                offset: 80,
                customLabels: myCustomLabels
            };

            return Book.aggregatePaginate(aggregate, options).then((result) => {
                expect(result.itemsList).toHaveLength(20);
                expect(result.itemsList[0].title).toEqual("Book #81");
                expect(result.itemCount).toEqual(100);
                expect(result.perPage).toEqual(20);
                expect(result.currentPage).toEqual(5);
                expect(result.pageCounter).toEqual(81);
                expect(result.hasPrev).toEqual(true);
                expect(result.hasNext).toEqual(false);
                expect(result.prev).toEqual(4);
                expect(result.next).toEqual(null);
                expect(result.pageCount).toEqual(5);
            });
        });
    });
});
