const { model, Schema } = require("mongoose");

const productSchema = new Schema(
    {
        batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
        departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        subCategoryId: { type: Schema.Types.ObjectId, ref: "SubCategory", required: true },
        brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
        subBrandId: { type: Schema.Types.ObjectId, ref: "SubBrand", default: null },
        verified: { type: Boolean, default: false, required: true },

        name: { type: String, required: true, index: "text" },
        description: { type: String },

        image: [{ contentType: String, type: Object, name: String, required: true }],
        featuredImage: { contentType: String, type: Object, name: String, required: true },

        orderPrice: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        stock: { type: Number, required: true },
        sold: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        tags: [{ type: String }],
        featured: { type: Boolean, default: false },

        colors: [{ color: String, stock: Number, colorCode: String, image: String }],
        sizes: [{ size: String, stock: Number, referenceColor: String }],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                ret._id = ret._id.toString(); // Ensure _id is string for Algolia
                delete ret.__v;
                return ret;
            },
        },
    }
);

module.exports.ProductModel = model("Product", productSchema);
