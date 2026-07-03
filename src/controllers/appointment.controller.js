import { Appointment } from "../models/Appointment.js";

function formatAppointment(appointment) {
  return {
    id: appointment._id,
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
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

export async function createAppointment(req, res, next) {
  try {
    const appointment = await Appointment.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointment: formatAppointment(appointment),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAppointments(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };

    const appointments = await Appointment.find(filter)
      .sort({ preferredDate: 1, createdAt: -1 })
      .populate("user", "name email");

    res.json({
      success: true,
      data: {
        appointments: appointments.map(formatAppointment),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAppointmentById(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const isOwner = appointment.user._id.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        appointment: formatAppointment(appointment),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const isOwner = appointment.user.toString() === req.user._id.toString();

    if (req.user.role === "admin") {
      appointment.status = req.body.status;
    } else if (isOwner && req.body.status === "cancelled") {
      appointment.status = "cancelled";
    } else {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own appointments",
      });
    }

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment updated",
      data: {
        appointment: formatAppointment(appointment),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

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
