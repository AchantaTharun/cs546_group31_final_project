import Event from '../models/eventModel.js';

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    if (events.length === 0) {
      return res.status(404).json({
        status: 'fail',
        errors: ['No events have been made yet'],
      });
    }
    return res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
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
      totalNumberOfAttendees,
    } = req.body;

    const newEvent = await Event.create({
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

    return res.status(201).json({
      status: 'success',
      data: {
        event: newEvent,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
      errors: [e.message],
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        errors: ['No event found with that ID'],
      });
    }
    return res.status(200).json({
      status: 'success',
      data: {
        event,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
      errors: [e.message],
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const updateData = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({
        status: 'fail',
        errors: ['No event found with that ID'],
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        event: updatedEvent,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
      errors: [e.message],
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        errors: ['No event found with that ID'],
      });
    }
    await Event.findByIdAndDelete(req.params.eventId);
    return res.status(204).json({
      status: 'success',
      data: 'Deleted event!',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
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
        status: 'fail',
        errors: ['No event found with that ID'],
      });
    }

    event.comments.push({
      userId: user._id,
      comment: comment,
      createdAt: new Date(),
    });

    const updatedEvent = await event.save();

    return res.status(200).json({
      status: 'success',
      data: {
        event: updatedEvent,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
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
        status: 'fail',
        errors: ['No event found with that ID'],
      });
    }

    event.comments = event.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await event.save();

    return res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
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
        status: 'fail',
        errors: ['No event found with that ID'],
      });
    }

    const commentIndex = event.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        errors: ['No comment found with that ID'],
      });
    }

    event.comments[commentIndex].comment = newComment;
    event.comments[commentIndex].updatedAt = new Date();
    await event.save();

    return res.status(200).json({
      status: 'success',
      message: 'Comment updated successfully',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'fail',
      errors: [e.message],
    });
  }
};

export const addAttendee = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const loggedInUserId = req.user.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ status: 'fail', errors: ['Event not found'] });
    }

    if (event.attendees.includes(loggedInUserId)) {
      return res.status(400).json({
        status: 'fail',
        errors: ['You are already registered as an attendee'],
      });
    }

    event.attendees.push(loggedInUserId);
    const updatedEvent = await event.save();

    res.status(200).json({ status: 'success', data: { event: updatedEvent } });
  } catch (e) {
    res.status(500).json({ status: 'fail', errors: [e.message] });
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
        .json({ status: 'fail', errors: ['Event not found'] });
    }

    if (!event.attendees.includes(attendeeId)) {
      return res
        .status(400)
        .json({ status: 'fail', errors: ['Attendee not found in event'] });
    }

    event.attendees = event.attendees.filter(
      (id) => id.toString() !== attendeeId
    );

    const updatedEvent = await event.save();
    res.status(200).json({ status: 'success', data: { event: updatedEvent } });
  } catch (e) {
    res.status(500).json({ status: 'fail', errors: [e.message] });
  }
};
