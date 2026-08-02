export default {
  async afterUpdate(event: any) {
    const { result, params } = event;

    // Status change jhala nasel tar notification nako
    if (
      result.appointmentStatus !== "completed" &&
      result.appointmentStatus !== "cancelled"
    ) {
      return;
    }

    // Duplicate notification prevent
    const existing = await strapi.documents("api::notification.notification").findMany({
      filters: {
        appointment: {
          documentId: {
            $eq: result.documentId,
          },
        },
        type: {
          $eq: result.appointmentStatus,
        },
      },
    });

    if (existing.length > 0) {
      return;
    }

    await strapi.documents("api::notification.notification").create({
      data: {
        title:
          result.appointmentStatus === "completed"
            ? "Appointment Completed"
            : "Appointment Cancelled",

        message:
          result.appointmentStatus === "completed"
            ? `Your appointment with ${result.doctorName} has been completed.`
            : `Your appointment with ${result.doctorName} has been cancelled.`,

        type: result.appointmentStatus,
        read: false,
        activityDate: result.date,
        activityTime: result.slotLabel,

        user: result.user,
        appointment: result.documentId,
      },

      status: "published",
    });
  },
};