const Contact = require('../models/Contact');
const User = require('../models/User');

// @desc Get user contacts / favorites
// @route GET /api/contacts
// @access Private
const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id })
      .populate('contactUserId', 'name upiId email phone avatar isFrozen')
      .sort({ isFavorite: -1, createdAt: -1 });

    const formatted = contacts
      .filter((c) => c.contactUserId)
      .map((c) => ({
        _id: c._id,
        contactUser: c.contactUserId,
        nickname: c.nickname || c.contactUserId.name,
        isFavorite: c.isFavorite
      }));

    res.status(200).json({
      success: true,
      contacts: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add a new contact
// @route POST /api/contacts
// @access Private
const addContact = async (req, res, next) => {
  try {
    const { identifier, nickname } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide UPI ID, email, or phone.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const contactUser = await User.findOne({
      $or: [
        { upiId: cleanId },
        { email: cleanId },
        { phone: identifier.trim() }
      ]
    });

    if (!contactUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (contactUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot add yourself to contacts.' });
    }

    const contact = await Contact.findOneAndUpdate(
      { userId: req.user._id, contactUserId: contactUser._id },
      { nickname: nickname || contactUser.name, isFavorite: true },
      { upsert: true, new: true }
    ).populate('contactUserId', 'name upiId email phone avatar');

    res.status(201).json({
      success: true,
      message: `${contactUser.name} added to your contacts!`,
      contact: {
        _id: contact._id,
        contactUser: contact.contactUserId,
        nickname: contact.nickname,
        isFavorite: contact.isFavorite
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Toggle contact favorite
// @route PATCH /api/contacts/:id/favorite
// @access Private
const toggleFavorite = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    res.status(200).json({
      success: true,
      isFavorite: contact.isFavorite
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete contact
// @route DELETE /api/contacts/:id
// @access Private
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Contact removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  addContact,
  toggleFavorite,
  deleteContact
};
