const express = require('express');
const router = express.Router();
const {
  getContacts,
  addContact,
  toggleFavorite,
  deleteContact
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getContacts);
router.post('/', addContact);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteContact);

module.exports = router;
