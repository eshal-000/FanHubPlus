import Submission from '../models/Submission.js';

// POST /api/submissions — user submits
export const createSubmission = async (req, res) => {
  try {
    const submission = await Submission.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({ message: 'Submission created', submission });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/submissions/mine — user's own submissions
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ submissions, count: submissions.length });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/submissions — admin: all submissions
export const getAllSubmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ submissions, count: submissions.length });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/submissions/:id
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('userId', 'name email');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/submissions/:id — admin approve/reject
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!['pending', 'approved', 'rejected', 'published'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNote !== undefined && { adminNote }) },
      { new: true }
    ).populate('userId', 'name email');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    res.json({ message: 'Submission status updated', submission });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/submissions/:id — admin
export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json({ message: 'Submission deleted' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};