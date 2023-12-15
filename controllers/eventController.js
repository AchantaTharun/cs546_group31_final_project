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
      user,
      eventDate,
      startTime,
      endTime,
      publicEvent,
      attendees,
    } = req.body;

    const totalNumberOfAttendees = 0;

    const newEvent = new Event({
      img,
      title,
      description,
      contactEmail,
      eventLocation,
      maxCapacity,
      priceOfAdmission,
      comments,
      user,
      eventDate,
      startTime,
      endTime,
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
      comments,
      user,
      eventDate,
      startTime,
      endTime,
      totalNumberOfAttendees,
    } = req.body;

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
    event.comments = comments;
    event.user = user;
    event.eventDate = eventDate;
    event.startTime = startTime;
    event.endTime = endTime;
    event.totalNumberOfAttendees = totalNumberOfAttendees;

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

export const addComment = async (req, res) => {
  const { comment } = req.body;
  const user = req.user;

  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        status: "fail",
        errors: ["No event found with that ID"],
      });
    }

    event.comments.push({
      userId: user._id,
      comment: comment,
      createdAt: new Date(),
    });

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

export const deleteComment = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const commentId = req.params.commentId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "fail",
        errors: ["No event found with that ID"],
      });
    }

    event.comments = event.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await event.save();

    return res.status(200).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      errors: [e.message],
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const commentId = req.params.commentId;
    const { newComment } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "fail",
        errors: ["No event found with that ID"],
      });
    }

    const commentIndex = event.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({
        status: "fail",
        errors: ["No comment found with that ID"],
      });
    }

    event.comments[commentIndex].comment = newComment;
    event.comments[commentIndex].updatedAt = new Date();

    const validationErrors = event.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ status: "fail", errors });
    }
    await event.save();

    return res.status(200).json({
      status: "success",
      message: "Comment updated successfully",
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
    const event = await Event.findById(eventId);
    
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

    event.attendees.push(loggedInUserId);
    const updatedEvent = await event.save();

    res.status(200).json({ status: "success", data: { event: updatedEvent } });
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

    const updatedEvent = await event.save();
    res.status(200).json({ status: "success", data: { event: updatedEvent } });
  } catch (e) {
    res.status(500).json({ status: "fail", errors: [e.message] });
  }
};
