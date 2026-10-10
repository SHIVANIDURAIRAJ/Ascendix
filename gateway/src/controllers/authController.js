const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getUsersCollection, getProfilesCollection } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ascendix_jwt_secret_token_secure_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Helper to generate JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /api/auth/register
 * Registers a new student account, hashes password, saves to MongoDB,
 * initializes a student profile stub, and returns JWT.
 */
async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      college,
      degree,
      branch,
      graduationYear,
    } = req.body;

    // 1. Validation checks
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and confirm password are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    const usersCollection = getUsersCollection();

    // 2. Duplicate email check
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please log in.',
      });
    }

    // 3. Password hashing
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const normalizedRole =
      req.body.role && ['ADMIN', 'FACULTY', 'STUDENT'].includes(String(req.body.role).toUpperCase())
        ? String(req.body.role).toUpperCase()
        : 'STUDENT';

    const now = new Date();
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: normalizedRole,
      college: college ? college.trim() : '',
      degree: degree ? degree.trim() : '',
      branch: branch ? branch.trim() : '',
      graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
      created_at: now,
      updated_at: now,
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

    // 4. Initialize clean student_profiles record for the user
    const profilesCollection = getProfilesCollection();
    const initialProfile = {
      user_id: userId,
      bio: '',
      cgpa: null,
      backlogs: 0,
      target_role_id: null,
      skills: [],
      projects: [],
      certifications: [],
      areas_of_interest: [],
      created_at: now,
      updated_at: now,
    };
    await profilesCollection.updateOne(
      { user_id: userId },
      { $setOnInsert: initialProfile },
      { upsert: true }
    );

    // 5. Generate JWT token
    const token = generateToken({
      userId,
      email: normalizedEmail,
      name: newUser.name,
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        college: newUser.college,
        degree: newUser.degree,
        branch: newUser.branch,
        graduationYear: newUser.graduation_year,
      },
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during registration. Please try again later.',
    });
  }
}

/**
 * POST /api/auth/login
 * Validates credentials, verifies bcrypt hash, and issues JWT.
 */
async function login(req, res) {
  try {
    const { email, password, loginRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const usersCollection = getUsersCollection();

    // 1. Find user by email
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // 2. Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const userRole = (user.role || 'STUDENT').toUpperCase();

    // If Admin login mode was explicitly requested, enforce ADMIN/FACULTY role
    if (
      loginRole &&
      ['ADMIN', 'FACULTY'].includes(String(loginRole).toUpperCase()) &&
      !['ADMIN', 'FACULTY'].includes(userRole)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. This account does not have Admin/Faculty privileges.',
      });
    }

    const userId = user._id.toString();

    // 3. Issue JWT
    const token = generateToken({
      userId,
      email: user.email,
      name: user.name,
      role: userRole,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: userRole,
        college: user.college || '',
        degree: user.degree || '',
        branch: user.branch || '',
        graduationYear: user.graduation_year || null,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during login. Please try again later.',
    });
  }
}

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user's profile details without sensitive fields.
 */
async function getMe(req, res) {
  try {
    const usersCollection = getUsersCollection();
    let query;
    try {
      query = { _id: new ObjectId(req.user.userId) };
    } catch {
      query = { _id: req.user.userId };
    }

    const user = await usersCollection.findOne(query, {
      projection: { password_hash: 0 },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User account not found.',
      });
    }

    const userRole = (user.role || 'STUDENT').toUpperCase();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: userRole,
        college: user.college || '',
        degree: user.degree || '',
        branch: user.branch || '',
        graduationYear: user.graduation_year || null,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('[Auth GetMe Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile.',
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
};
