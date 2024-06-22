import mongoose from "mongoose";
import aggregatePaginate from "./core"

export { PREPAGINATION_PLACEHOLDER } from "./core";

/**
 * @param {Schema} schema
*/
const plugin = function (schema) {
    schema.statics.aggregatePaginate = aggregatePaginate;
    mongoose.Aggregate.prototype.paginateExec = function (options, cb) {
        return this.model().aggregatePaginate(this, options, cb);
    };
}

plugin.aggregatePaginate = aggregatePaginate;

export default plugin;