const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['creator', 'admin', 'member'], default: 'member' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    joinedAt: Date,
}, { _id: false });

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: String,
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    inviteCode: { type: String, unique: true },
}, { timestamps: true });

// Generate invite code before saving
groupSchema.pre('save', function () {
    if (!this.inviteCode) {
        this.inviteCode = crypto.randomBytes(6).toString('hex');
    }
});

module.exports = mongoose.model('Group', groupSchema);
