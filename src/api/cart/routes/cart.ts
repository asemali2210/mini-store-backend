export default {
  type: "content-api",
  routes: [
    {
      method: "GET",
      path: "/cart",
      handler: "cart.index",
      config: {
        auth: { strategies: ["users-permissions"] },
      },
    },
    {
      method: "POST",
      path: "/cart",
      handler: "cart.create",
      config: {
        auth: { strategies: ["users-permissions"] },
      },
    },
    {
      method: "PUT",
      path: "/cart/:documentId",
      handler: "cart.update",
      config: {
        auth: { strategies: ["users-permissions"] },
      },
    },
    {
      method: "DELETE",
      path: "/cart/:documentId",
      handler: "cart.delete",
      config: {
        auth: { strategies: ["users-permissions"] },
      },
    },
    {
      method: "GET",
      path: "/cart/:documentId", // ✅ Get one cart item by ID
      handler: "cart.findOne",
      config: {
        auth: { strategies: ["users-permissions"] },
      },
    },
  ],
};
