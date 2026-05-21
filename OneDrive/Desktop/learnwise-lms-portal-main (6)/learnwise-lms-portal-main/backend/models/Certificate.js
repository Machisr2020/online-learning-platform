
const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  validUntil: {
    type: Date
  },
  pdfUrl: {
    type: String
  }
});

// Generate a unique certificate ID before saving
CertificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.certificateId = `CERT-${randomString}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);
