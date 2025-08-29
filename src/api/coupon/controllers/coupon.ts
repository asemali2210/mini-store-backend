// src/api/coupon/controllers/coupon.js
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::coupon.coupon", ({ strapi }) => ({
  async validate(ctx) {
    const { code } = ctx.request.query;

    const coupon = await strapi.db.query("api::coupon.coupon").findOne({
      where: { code: code.toUpperCase(), is_active: true },
    });

    if (!coupon) {
      return ctx.badRequest("Invalid or inactive coupon");
    }

    const now = new Date();
    const expiry = new Date(coupon.expires_at);

    if (expiry < now) {
      return ctx.badRequest("Coupon expired");
    }

    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    };
  },
}));
