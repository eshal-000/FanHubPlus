const mongoose = require("mongoose");
const { EVENT_TYPES } = require("./constants");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Event title is required"], trim: true, maxlength: 160 },
    eventType: { type: String, enum: EVENT_TYPES, required: true, index: true },
    city: { type: String, required: [true, "City is required"], trim: true, maxlength: 80, index: true },
    address: { type: String, default: "", maxlength: 200 },
    lat: { type: Number, min: -90, max: 90, default: null },
    long: { type: Number, min: -180, max: 180, default: null },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        default: undefined,
        validate: {
          validator(v) {
            return v == null || v.length === 2;
          },
          message: "coordinates must be [lng, lat]",
        },
      },
    },
    startDate: { type: Date, required: [true, "Start date is required"], index: true },
    endDate: { type: Date, default: null },
    ticketUrl: { type: String, default: "" },
    story: { type: String, default: "", maxlength: 20000 },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

eventSchema.pre("validate", function () {
  const hasLatLng = this.lat != null && this.long != null;
  if (hasLatLng) {
    this.location = { type: "Point", coordinates: [this.long, this.lat] };
  } else if (this.location?.coordinates?.length === 2 && (this.lat == null || this.long == null)) {
    const [lng, lat] = this.location.coordinates;
    this.lat = lat;
    this.long = lng;
  }
});

eventSchema.index({ city: 1, eventType: 1, startDate: -1 });
eventSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Event", eventSchema);