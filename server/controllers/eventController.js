const Event = require("../models/Event");

exports.getEvents = async (req, res, next) => {
  try {
    const { city, eventType, timeFilter } = req.query;
    const now = new Date();

    const query = {};
    if (city) query.city = city;
    if (eventType) query.eventType = eventType;

    let sortSpec = { startDate: 1 };

    if (timeFilter === "past") {

      query.startDate = { $lt: now };
      query.$or = [{ endDate: { $lt: now } }, { endDate: null }];
      sortSpec = { startDate: -1 };
    } else if (timeFilter === "live") {

      query.startDate = { $lte: now };
      query.$or = [{ endDate: { $gte: now } }, { endDate: null }];
      sortSpec = { startDate: 1 };
    } else if (timeFilter === "upcoming") {
      query.startDate = { $gt: now };
      sortSpec = { startDate: 1 };
    }

    const page = parseInt(req.query.page, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 24, 100);
    const paginate = Number.isFinite(page) && page > 0;

    const mongoQuery = Event.find(query).sort(sortSpec);
    if (paginate) {
      mongoQuery.skip((page - 1) * limit).limit(limit);
    } else if (req.query.limit) {
      mongoQuery.limit(limit);
    }

    const items = await mongoQuery.lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Event not found." });

    const relatedEvents = await Event.find({
      _id: { $ne: event._id },
      $or: [{ city: event.city }, { eventType: event.eventType }],
    })
      .sort({ startDate: 1 })
      .limit(3)
      .lean();

    res.json({ event, relatedEvents });
  } catch (err) {
    next(err);
  }
};
