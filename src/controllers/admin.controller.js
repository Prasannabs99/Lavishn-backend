import { Appointment } from "../models/Appointment.js";
import { ContactInquiry } from "../models/ContactInquiry.js";
import { Service } from "../models/Service.js";
import { User } from "../models/User.js";

function idOf(doc) {
  return String(doc._id);
}

function formatAppointment(appointment) {
  return {
    id: idOf(appointment),
    user: appointment.user,
    patientName: appointment.patientName,
    email: appointment.email,
    phone: appointment.phone,
    hospital: appointment.hospital,
    service: appointment.service,
    preferredDate: appointment.preferredDate,
    preferredTime: appointment.preferredTime,
    notes: appointment.notes,
    status: appointment.status,
    amountInPaise: appointment.amountInPaise || 0,
    paymentStatus: appointment.paymentStatus || "unpaid",
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

function formatService(service) {
  const priceInPaise = Number(service.priceInPaise || 0);
  return {
    id: idOf(service),
    slug: service.slug,
    title: service.title,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceInPaise,
    priceDisplay: (priceInPaise / 100).toLocaleString("en-IN"),
    currency: service.currency || "INR",
    isActive: service.isActive !== false,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

function formatUser(user) {
  return {
    id: idOf(user),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function formatInquiry(inquiry) {
  return {
    id: idOf(inquiry),
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    subject: inquiry.subject,
    message: inquiry.message,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
  };
}

export async function getStats(req, res, next) {
  try {
    const [
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      paidAppointments,
      unpaidAppointments,
      revenueAgg,
      activeServices,
      users,
      inquiries,
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ paymentStatus: "paid" }),
      Appointment.countDocuments({
        paymentStatus: { $in: ["unpaid", "pending", null] },
      }),
      Appointment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amountInPaise" } } },
      ]),
      Service.countDocuments({ isActive: true }),
      User.countDocuments(),
      ContactInquiry.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          appointments: {
            total: totalAppointments,
            pending: pendingAppointments,
            confirmed: confirmedAppointments,
          },
          payments: {
            revenueInPaise: revenueAgg[0]?.total || 0,
            paid: paidAppointments,
            unpaid: unpaidAppointments,
          },
          activeServices,
          users,
          inquiries,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAppointments(req, res, next) {
  try {
    const { search = "", status = "", paymentStatus = "" } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      filter.$or = [
        { patientName: regex },
        { email: regex },
        { phone: regex },
        { service: regex },
        { hospital: regex },
      ];
    }

    const appointments = await Appointment.find(filter)
      .sort({ preferredDate: 1, createdAt: -1 })
      .populate("user", "name email");

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments: appointments.map(formatAppointment),
        meta: { total },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status, paymentStatus, amountInPaise } = req.body;
    const updates = {};

    if (status !== undefined) {
      const allowed = ["pending", "confirmed", "cancelled", "completed"];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment status",
        });
      }
      updates.status = status;
    }

    if (paymentStatus !== undefined) {
      const allowedPay = ["unpaid", "pending", "paid", "failed"];
      if (!allowedPay.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }
      updates.paymentStatus = paymentStatus;
    }

    if (amountInPaise !== undefined) {
      const amount = Number(amountInPaise);
      if (!Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount",
        });
      }
      updates.amountInPaise = Math.round(amount);
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    ).populate("user", "name email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Appointment updated",
      data: { appointment: formatAppointment(appointment) },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Appointment deleted",
    });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req, res, next) {
  try {
    const { status = "" } = req.query;
    const filter = {};

    if (status) {
      // Map payments page filters onto appointment paymentStatus
      if (status === "created" || status === "attempted") {
        filter.paymentStatus = "pending";
      } else if (["paid", "failed", "unpaid", "pending"].includes(status)) {
        filter.paymentStatus = status;
      }
    }

    const appointments = await Appointment.find(filter)
      .sort({ updatedAt: -1 })
      .populate("user", "name email")
      .limit(200);

    const payments = appointments.map((appt) => ({
      id: idOf(appt),
      user: appt.user ? { name: appt.user.name, email: appt.user.email } : null,
      appointment: {
        id: idOf(appt),
        service: appt.service,
        patientName: appt.patientName,
        status: appt.status,
      },
      amountInPaise: appt.amountInPaise || 0,
      razorpayOrderId: "—",
      razorpayPaymentId: null,
      status: appt.paymentStatus || "unpaid",
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
    }));

    res.json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
}

export async function getServices(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const services = await Service.find().sort({ title: 1 }).limit(limit);

    res.json({
      success: true,
      data: {
        services: services.map(formatService),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createService(req, res, next) {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({
      success: true,
      message: "Service created",
      data: { service: formatService(service) },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Service slug already exists",
      });
    }
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service updated",
      data: { service: formatService(service) },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Service slug already exists",
      });
    }
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service deleted",
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const { search = "" } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users: users.map(formatUser),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const updates = {};
    if (req.body.role !== undefined) updates.role = req.body.role;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    if (updates.role && !["user", "admin"].includes(updates.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated",
      data: { user: formatUser(user) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getInquiries(req, res, next) {
  try {
    const { search = "" } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { subject: regex },
        { message: regex },
      ];
    }

    const inquiries = await ContactInquiry.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: {
        inquiries: inquiries.map(formatInquiry),
      },
    });
  } catch (error) {
    next(error);
  }
}
