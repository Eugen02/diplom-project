import { Schema } from "mongoose";

const transformSchema = (doc: any, ret: any): void => {
  delete ret._id;
  delete ret.__v;
};

export const addVirtualsToSchema = (schema: Schema) => {
  schema.virtual("id").get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: transformSchema,
  });
};
