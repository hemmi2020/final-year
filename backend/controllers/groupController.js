const Group = require('../models/Group');

// GET /api/groups — list user's groups
exports.getAll = async (req, res, next) => {
    try {
        const groups = await Group.find({
            $or: [
                { creator: req.user._id },
                { 'members.user': req.user._id, 'members.status': 'accepted' },
            ],
        })
            .populate('creator', 'name email')
            .populate('members.user', 'name email')
            .populate('trip', 'title destination')
            .sort('-createdAt');

        res.json({ success: true, data: groups });
    } catch (error) {
        next(error);
    }
};

// POST /api/groups — create a group
exports.create = async (req, res, next) => {
    try {
        const { name, description, tripId } = req.body;

        const group = await Group.create({
            name,
            description,
            trip: tripId || undefined,
            creator: req.user._id,
            members: [{ user: req.user._id, role: 'creator', status: 'accepted', joinedAt: new Date() }],
        });

        const populated = await group.populate([
            { path: 'creator', select: 'name email' },
            { path: 'members.user', select: 'name email' },
        ]);

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        next(error);
    }
};

// GET /api/groups/:id — get group details
exports.getById = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('creator', 'name email')
            .populate('members.user', 'name email avatar')
            .populate('trip');

        if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

        // Check access — must be creator or accepted member
        const isCreator = group.creator._id.toString() === req.user._id.toString();
        const isMember = group.members.some(
            (m) => m.user._id.toString() === req.user._id.toString() && m.status === 'accepted'
        );
        if (!isCreator && !isMember) {
            return res.status(403).json({ success: false, error: 'Not a member of this group' });
        }

        res.json({ success: true, data: group });
    } catch (error) {
        next(error);
    }
};

// POST /api/groups/:id/invite — invite a user by email
exports.invite = async (req, res, next) => {
    try {
        const { email } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ success: false, error: 'Group not found' });
        if (group.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Only the creator can invite members' });
        }

        // Find user by email
        const User = require('../models/User');
        const invitee = await User.findOne({ email });
        if (!invitee) return res.status(404).json({ success: false, error: 'User not found with that email' });

        // Check if already a member
        const existing = group.members.find((m) => m.user.toString() === invitee._id.toString());
        if (existing) return res.status(400).json({ success: false, error: 'User already invited or a member' });

        group.members.push({ user: invitee._id, role: 'member', status: 'pending' });
        await group.save();

        res.json({ success: true, data: { message: 'Invitation sent', inviteCode: group.inviteCode } });
    } catch (error) {
        next(error);
    }
};

// POST /api/groups/join/:inviteCode — accept invitation via invite code
exports.acceptInvite = async (req, res, next) => {
    try {
        const group = await Group.findOne({ inviteCode: req.params.inviteCode });
        if (!group) return res.status(404).json({ success: false, error: 'Invalid invite code' });

        const member = group.members.find((m) => m.user.toString() === req.user._id.toString());

        if (member) {
            if (member.status === 'accepted') {
                return res.status(400).json({ success: false, error: 'Already a member' });
            }
            member.status = 'accepted';
            member.joinedAt = new Date();
        } else {
            // Direct join via invite code (no prior invitation needed)
            group.members.push({
                user: req.user._id,
                role: 'member',
                status: 'accepted',
                joinedAt: new Date(),
            });
        }

        await group.save();

        const populated = await group.populate([
            { path: 'creator', select: 'name email' },
            { path: 'members.user', select: 'name email' },
        ]);

        res.json({ success: true, data: populated });
    } catch (error) {
        next(error);
    }
};
