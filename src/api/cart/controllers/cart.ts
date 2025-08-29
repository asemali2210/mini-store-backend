import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::cart.cart",
  ({ strapi }) => ({
    // 🧾 Get all cart items for the logged-in user
    async index(ctx) {
      const { user } = ctx.state;

      if (!user) {
        return ctx.unauthorized("You must be logged in to view your cart.");
      }

      // Use the service layer for fetching and populating
      const cartItems = await strapi.service("api::cart.cart").find({
        filters: {
          user: user.id,
          publishedAt: { $notNull: true },
        },
        populate: ["product", "product.images"],
      });

      const sanitized = await this.sanitizeOutput(cartItems.results, ctx);
      ctx.body = { data: sanitized, meta: cartItems.pagination };
    },

    // ➕ Add to cart (Create or Update quantity)
    async create(ctx) {
      const { user } = ctx.state;
      const { product, quantity } = ctx.request.body.data;

      if (!user) {
        return ctx.unauthorized("You must be logged in to add to cart.");
      }

      if (!product || typeof quantity !== "number") {
        return ctx.badRequest("Missing or invalid product or quantity.");
      }

      // Check for existing cart item
      const existingItem = await strapi.service("api::cart.cart").find({
        filters: {
          user: {
            documentId: user.documentId,
          },
          product: {
            documentId: product.documentId,
          },
        },
        populate: ["product", "product.images"],
      });

      if (existingItem.results.length > 0) {
        // ✅ Update existing quantity
        const item = existingItem.results[0];
        const updated = await strapi
          .service("api::cart.cart")
          .update(item.documentId, {
            data: { quantity: Number(item.quantity) + Number(quantity) },
            populate: ["product", "product.images"],
          });
        const sanitized = await this.sanitizeOutput(updated, ctx);
        ctx.body = {
          data: sanitized,
          message: "Item is already in cart, quantity updated.",
        };
      } else {
        // 🆕 Create new item
        const newItem = await strapi.service("api::cart.cart").create({
          data: {
            user: user.documentId,
            product,
            quantity,
          },
          populate: ["product", "product.images"],
        });
        const sanitized = await this.sanitizeOutput(newItem, ctx);
        ctx.body = {
          data: sanitized,
          message: "Item added to cart.",
        };
      }
    },

    // ✏️ Update quantity manually
    async update(ctx) {
      const { documentId } = ctx.params;
      const { quantity } = ctx.request.body.data;

      if (typeof quantity !== "number") {
        return ctx.badRequest("Quantity must be a valid number.");
      }
      try {
        // Update the cart item
        const updatedItem = await strapi
          .service("api::cart.cart")
          .update(documentId, {
            data: { quantity },
            populate: ["product", "product.images"],
          });

        // Sanitize the output
        const sanitizedItem = await this.sanitizeOutput(updatedItem, ctx);

        ctx.body = { data: sanitizedItem };
      } catch (error) {
        console.error("Update error:", error);
        return ctx.internalServerError("Something went wrong.");
      }
    },

    // 🔎 Find one cart item
    async findOne(ctx) {
      const { documentId } = ctx.params;

      if (!documentId) {
        return ctx.badRequest("Invalid cart ID");
      }

      const cartItem = await strapi
        .service("api::cart.cart")
        .findOne(documentId, {
          populate: ["product", "product.images"],
        });

      if (!cartItem) {
        return ctx.notFound("Cart item not found");
      }

      const sanitized = await this.sanitizeOutput(cartItem, ctx);
      ctx.body = { data: sanitized };
    },

    // 🗑️ Delete cart item
    async delete(ctx) {
      const { documentId } = ctx.params;

      try {
        const deletedItem = await strapi
          .service("api::cart.cart")
          .delete(documentId);
        const sanitized = await this.sanitizeOutput(deletedItem, ctx);
        ctx.body = { data: sanitized };
      } catch (error) {
        return ctx.internalServerError("Something went wrong.");
      }
    },
  })
);
