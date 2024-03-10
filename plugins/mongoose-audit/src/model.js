const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    entity_id: {},
    entity: String,
    collection: String,
    changes: {},
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      collection: "users"
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

const model = mongoose.model("Audit", auditSchema);

export default model;
