export default {
  routes: [
    {
      method: "POST",
      path: "/otp/send",
      handler: "otp.send",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/otp/verify",
      handler: "otp.verify",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/otp/register",
      handler: "otp.register",
      config: {
        auth: false,
      },
    },
  ],
};