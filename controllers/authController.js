// We handle authentication related logic in this authController

const { promisify } = require('util'); // We use this to promisify jwt.verify()

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  // better to promisify and use the async version
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN, // sets the expiry date
    }
  );
};

// Controller method name is signUp (*Not* createUser) because that is the most meaningful name
// in the context of creating a new user
exports.signup = catchAsync(async (req, res, next) => {
  // Here we do not directly pass req.body to User.create. If we did so,
  // the client will be able to do things like sending the data to make the user an admin etc...
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password, // encryption is handled in the data layer
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token, // token is not sent in the data property
    data: {
      user: newUser, // password select should be set to false in the data layer
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // In this method, we do not create a new user etc... Hence validation is not handled
  // in the data layer.
  // So we have to do validation from scarch.
  // That includes checking things like if the email and password actually exists in the
  // request body

  const { email, password } = req.body;

  // 1. Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if the user exits && the password is correct

  // We have to explicitly select password since it is not selected by default.
  // we have to use the + sign to explicitly select the password field
  const user = await User.findOne({ email }).select('+password');

  // We delegate the password comparison to the data layer since that is where it should happen

  // Following code will not run if a user does not exist. So we directly include
  // code next to the equal sign directly in the if check
  // const correct = await user.correctPassword(password. user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Everything okay? Send the Jsonwebtoken
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token, // token is not sent in the data property
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get the token and check if it is there
  let token;

  // Checks if the header exists and if it starts with the term 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // We also check for the existance of the jwt cookie other than the bearer token
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401)
    );
  }

  // 2. Validate the token (Verification)

  // We promisify the jwt.verify function and await it
  // Two errors can occur while executing the following line of code
  //    1) Data in the token could have been changed
  //    2) The token could have expired
  // Rather than handling the above two errors here directly using
  // try and catch, we delegate it to our global error handling middleware
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if the user still exists

  // We execute this step because what if the user has been deleted in the meantime?
  // In that case, the token would exist, but the user won't

  // Since the verification process above worked, id is correct.
  // Verification process is really the key
  const currentUser = await User.findById({ _id: decoded.id }); // use findById to query by id

  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token no longer exists', 401)
    );
  }

  // 4. Check if the user has changed their password after the token was issued

  // What if the user has changed the password after the token has issued?
  // For example, let's say someone gets ahold of the users token. So he changes
  // his password to protect against it. We do not want to log a user in with the token that has been issued
  // in the first place now

  // To check if the user has changed the password after the token is issued, we create an instance
  // method. We do this because it is too much code to handle here and it really belongs to the user
  // model not the controller

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed the password. Please login again',
        401
      )
    );
  }

  // next() will be called if there are no problems with the above steps
  // set the user as freshUser
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Since arguments can not be passed to the middleware functions, we have to find
// a way to pass arguments. Following is the way to pass arguments to a middleware
exports.restrictTo = (...roles) => {
  // ...roles will create an array of arguments we specify
  return (req, res, next) => {
    // includes is a nice array method in javascript that can be used to check if an
    // element exists in an array
    // We get the role of the current user from the middleware before
    if (!roles.includes(req.user.role)) {
      // 403 means forbidden
      return next(
        new AppError('You do not have permission to perform this access', 403)
      );
    }
    next();
  };
};
