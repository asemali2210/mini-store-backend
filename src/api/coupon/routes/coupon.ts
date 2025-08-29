// src/api/coupon/routes/custom-coupon.js
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/validate-coupon",
      handler: "coupon.validate",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
