import { Service } from "../models/Service.js";

export async function getServices(req, res, next) {
  try {
    const services = await Service.find({ isActive: true }).sort({ title: 1 });
    res.json({
      success: true,
      data: {
        services,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getServiceBySlug(req, res, next) {
  try {
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    res.json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
}
