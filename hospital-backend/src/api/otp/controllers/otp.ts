import type { Context } from "koa";
import bcrypt from "bcryptjs";

export default {
  async send(ctx: Context) {
    try {
      const { email: rawEmail } = ctx.request.body as { email: string };

      if (!rawEmail) {
        return ctx.badRequest("Email is required");
      }

      const email = rawEmail.trim().toLowerCase();

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Expire after 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      strapi.log.info(`OTP Send Request: ${email}`);

      // Delete old OTPs (both draft & published) for this email
      const oldOtp = await strapi.documents("api::otp.otp").findMany({
        filters: { email },
      });

      for (const item of oldOtp) {
        await strapi.documents("api::otp.otp").delete({
          documentId: item.documentId,
        });
      }

      strapi.log.info("=== SEND OTP START ===");
      strapi.log.info(`Email: ${email}`);

      // Save and PUBLISH new OTP
      const createdOtp = await strapi.documents("api::otp.otp").create({
        data: {
          email,
          otp,
          expiresAt,
        },
      });

      strapi.log.info("OTP CREATED");
      strapi.log.info(JSON.stringify(createdOtp));
      strapi.log.info("BEFORE EMAIL");

      // Send email
      await strapi.plugin("email").service("email").send({
        to: email,
        subject: "MediBook Email Verification OTP",
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        html: `
          <h2>MediBook Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        `,
      });

      strapi.log.info("AFTER EMAIL");

      ctx.body = {
        success: true,
        message: "OTP sent successfully",
      };
    } catch (err: any) {
      console.error("OTP SEND ERROR =>", err);
      strapi.log.error(`OTP SEND ERROR => ${err?.message}`);
      ctx.internalServerError(err?.message || "Something went wrong");
    }
  },

  async verify(ctx: Context) {
    try {
      const { email: rawEmail, otp } = ctx.request.body as {
        email: string;
        otp: string;
      };

      if (!rawEmail || !otp) {
        return ctx.badRequest("Email and OTP are required");
      }

      const email = rawEmail.trim().toLowerCase();
      const cleanOtp = otp.trim();

      const records = await strapi.documents("api::otp.otp").findMany({
        filters: { email },
      });

      if (records.length === 0) {
        return ctx.badRequest("OTP not found");
      }

      const record = records[0];

      if (record.otp !== cleanOtp) {
        return ctx.badRequest("Invalid OTP");
      }

      if (!record.expiresAt) {
        return ctx.badRequest("OTP expiry not found");
      }

      const expiry = new Date(record.expiresAt as string);

      if (expiry < new Date()) {
        return ctx.badRequest("OTP expired");
      }

      // Delete OTP after successful verification
      await strapi.documents("api::otp.otp").delete({
        documentId: record.documentId,
      });

      ctx.body = {
        success: true,
        message: "OTP Verified",
      };
    } catch (err) {
      console.error(err);
      ctx.internalServerError("Something went wrong");
    }
  },

  async register(ctx: Context) {
    try {
      const { name, email, phone, dob, gender, password } = ctx.request.body as {
        name: string;
        email: string;
        phone: string;
        dob: string;
        gender: string;
        password: string;
      };

      if (!name || !email || !phone || !dob || !gender || !password) {
        return ctx.badRequest("All fields are required");
      }

      const existing = await strapi
        .documents("plugin::users-permissions.user")
        .findMany({
          filters: {
            email: email.trim().toLowerCase(),
          },
        });

      if (existing.length > 0) {
        return ctx.badRequest("Email already exists");
      }

      const roles = await strapi
        .documents("plugin::users-permissions.role")
        .findMany({
          filters: {
            type: "authenticated",
          },
        });

      console.log("ROLES =>", roles);

      if (!roles.length) {
        return ctx.internalServerError("Authenticated role not found");
      }

      // Password hashing before creating user

      const user = await strapi
        .plugin("users-permissions")
        .service("user")
        .add({
          username: email.split("@")[0],
          email: email.trim().toLowerCase(),
          password: password,
          confirmed: true,
          blocked: false,
          provider: "local",
          role: roles[0].id,
          name,
          phone,
          dob,
          gender: gender.toLowerCase(),
        });

      console.log("USER CREATED =>", user);

      ctx.body = {
        success: true,
        user,
      };
    } catch (err) {
      console.error("REGISTER ERROR =>", err);
      ctx.internalServerError("Registration failed");
    }
  },
};