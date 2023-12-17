import Event from "../models/eventModel.js";

import mongoose from "mongoose";

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    if (events.length === 0) {
      return res.status(404).json({
        status: "fail",
        errors: ["No events have been made yet"],
      });
    }
    return res.status(200).json({
      status: "success",
      results: events.length,
      data: {
        events,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      errors: [e.message],
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      img,
      title,
      description,
      contactEmail,
      eventLocation,
      maxCapacity,
      priceOfAdmission,
      comments,
      eventDate,
      startTime,
      endTime,
      publicEvent,
      attendees,
      loggedInUserId
    } = req.body;


    console.log("logged in useer id: ",loggedInUserId)
    if(!loggedInUserId) return res.status(400).json({ status: "fail", errors: ["Invalid User"] });

    const totalNumberOfAttendees = 0;
    
    const finalEventDate = new Date(`${eventDate}T${startTime}`);
    const finalStartTime = new Date(`${eventDate}T${startTime}`);
    const finalEndTime = new Date(`${eventDate}T${endTime}`);


    const newEvent = new Event({
      img,
      title,
      description,
      contactEmail,
      eventLocation,
      maxCapacity,
      priceOfAdmission,
      comments,
      user: {userId:loggedInUserId},
      eventDate: finalEventDate,
      startTime: finalStartTime,
      endTime: finalEndTime,
      publicEvent,
      attendees,
      totalNumberOfAttendees,
    });

    const validationErrors = newEvent.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ status: "fail", errors });
    }

    const savedEvent = await newEvent.save();

    return res.status(201).json({
      status: "success",
      data: {
        event: savedEvent,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      errors: [e.message],
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        status: "fail",
        errors: ["No event found with that ID"],
      });
    }
    return res.status(200).json({
      status: "success",
      data: {
        event,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      errors: [e.message],
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      img,
      title,
      description,
      contactEmail,
      eventLocation,
      maxCapacity,
      priceOfAdmission,
      eventDate,
      startTime,
      endTime,
    } = req.body;

    const finalEventDate = new Date(`${eventDate}T${startTime}`);
    const finalStartTime = new Date(`${eventDate}T${startTime}`);
    const finalEndTime = new Date(`${eventDate}T${endTime}`);

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ status: "fail", errors: ["Invalid event ID"] });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ status: "fail", errors: ["Event not found"] });
    }

    event.img = img;
    event.title = title;
    event.description = description;
    event.contactEmail = contactEmail;
    event.eventLocation = eventLocation;
    event.maxCapacity = maxCapacity;
    event.priceOfAdmission = priceOfAdmission;
    event.eventDate = finalEventDate;
    event.startTime = finalStartTime;
    event.endTime = finalEndTime;

    const validationErrors = event.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ status: "fail", errors });
    }
    const updatedEvent = await event.save();

    return res.status(200).json({
      status: "success",
      data: {
        event: updatedEvent,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      errors: [e.message],
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        status: "fail",
        errors: ["No event found with that ID"],
      });
    }
    await Event.findByIdAndDelete(req.params.eventId);
    return res.status(204).json({
      status: "success",
      data: "Deleted event!",
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      errors: [e.message],
    });
  }
};

export const addAttendee = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const loggedInUserId = req.params.attendeeId;
    
    let event = await Event.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ status: "fail", errors: ["Event not found"] });
    }

    if (event.attendees.includes(loggedInUserId)) {
      return res.status(400).json({
        status: "fail",
        errors: ["You are already registered as an attendee"],
      });
    }

    if (event.totalNumberOfAttendees < event.maxCapacity) {
      event.attendees.push(loggedInUserId);
      event.totalNumberOfAttendees = event.totalNumberOfAttendees + 1;
      const updatedEvent = await event.save();
      res.status(200).json({ status: "success", data: { event: updatedEvent } });
    }else{  
      return res.status(400).json({
        status: "fail",
        errors: ["Max capacity reached for the event"],
      });
    }
  } catch (e) {
    res.status(500).json({ status: "fail", errors: [e.message] });
  }
};

export const removeAttendee = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const attendeeId = req.body.attendeeId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ status: "fail", errors: ["Event not found"] });
    }

    if (!event.attendees.includes(attendeeId)) {
      return res
        .status(400)
        .json({ status: "fail", errors: ["Attendee not found in event"] });
    }

    event.attendees = event.attendees.filter(
      (id) => id.toString() !== attendeeId
    );
    event.totalNumberOfAttendees = event.totalNumberOfAttendees - 1;
    const updatedEvent = await event.save();
    res.status(200).json({ status: "success", data: { event: updatedEvent } });
  } catch (e) {
    res.status(500).json({ status: "fail", errors: [e.message] });
  }
};
