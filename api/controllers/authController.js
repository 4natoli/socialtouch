const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const sgMail = require('@sendgrid/mail');
const AppError = require('../utils/appError');
const catchError = require('../utils/catchError');
const validate = require('../utils/validate');
const userConstraints = require('../validators/userConstraints');
const User = require('../entities/userSchema');
const UserSettings = require('../entities/userSettingsSchema');
const UserModel = require('../models/userModel');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const signToken = (id, salt) => {
  return jwt.sign({ id }, process.env.JWT_SECRET + salt, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieOptions =
  process.env.NODE_ENV !== 'development'
    ? {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      }
    : {};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id, user.salt);

  res.cookie('jwt', token, {
    ...cookieOptions,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 86400000 // 24 * 60 * 60 * 1000
    ),
  });

  res.status(statusCode).json({
    status: 'success',
    data: {
      user: {
        username: user.username,
        email: user.email,
        link: user.link,
        image: user.image || undefined,
      },
    },
  });
};

exports.signup = catchError(async ({ connection, body }, res, next) => {
  const user = new UserModel(
    body.username,
    body.email,
    body.password,
    body.passwordConfirm
  );

  const validation = validate(user, userConstraints.create);
  if (validation) return next(new AppError(validation, 400));

  const newUser = await connection
    .getRepository(User)
    .save(await user.prepare());

  await connection.getRepository(UserSettings).save({ userId: newUser.id });

  createSendToken(newUser, 201, res);
});

exports.signin = catchError(async ({ connection, body }, res, next) => {
  const { email, password } = body;

  const validation = validate(
    { email, password },
    userConstraints.emailAndPassword
  );
  if (validation) return next(new AppError(validation, 400));

  const user = await connection
    .getRepository(User)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.image', 'img')
    .select(['user', 'img.location'])
    .addSelect(['user.id'])
    .where('user.active = 1 AND user.email = :email', { email })
    .getOne();

  if (!user || !(await UserModel.correctPassword(password, user.passwordHash)))
    return next(new AppError('Incorrect email or password', 401));

  createSendToken(user, 200, res);
});

exports.protect = catchError(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );

  const { id } = jwt.decode(token);

  const user = await req.connection
    .getRepository(User)
    .findOne({ active: true, id });

  if (!user)
    return next(
      new AppError('The user belonging to this token does no longer exist')
    );

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET + user.salt
  );

  if (UserModel.changedPasswordAfter(user.passwordChangedAt, decoded.iat))
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );

  req.user = user;
  next();
});

exports.forgotPassword = catchError(async ({ connection, body }, res, next) => {
  const validation = validate({ email: body.email }, userConstraints.email);
  if (validation) return next(new AppError(validation, 400));

  const repo = connection.getRepository(User);

  const user = await repo.findOne({ active: true, email: body.email });

  if (!user)
    return next(new AppError('There is no user with email address', 404));

  const {
    passwordResetToken,
    resetToken,
  } = UserModel.createPasswordResetToken();

  await repo
    .createQueryBuilder()
    .update()
    .set({
      passwordResetToken: passwordResetToken,
    })
    .where('id = :id', { id: user.id })
    .execute();

  const link = `${process.env.CLIENT_HOST}/restore/${resetToken}`;

  await sgMail.send({
    to: user.email,
    from: '4natoli.t@gmail.com',
    subject: 'Reset password on socialTouch',
    html: `<strong>Link to reset password:</strong> <a href="${link}">${link}</a>`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

exports.resetPassword = catchError(
  async ({ connection, params, body }, res, next) => {
    const repo = connection.getRepository(User);

    const hashedToken = crypto
      .createHash('sha256')
      .update(params.token)
      .digest('hex');

    const user = await repo.findOne({
      active: true,
      passwordResetToken: hashedToken,
    });

    if (!user) return next(new AppError('Token has expired', 400));

    const { password, passwordConfirm } = body;

    const validation = validate(
      { password, passwordConfirm },
      userConstraints.newPassword
    );
    if (validation) return next(new AppError(validation, 400));

    await repo
      .createQueryBuilder()
      .update()
      .set({
        passwordResetToken: null,
        passwordHash: await UserModel.hashPassword(password),
        passwordChangedAt: new Date().toISOString(),
      })
      .where('id = :id', { id: user.id })
      .execute();

    createSendToken(user, 200, res);
  }
);

exports.updatePassword = catchError(
  async ({ connection, user: currentUser, body }, res, next) => {
    const { password, passwordConfirm, newPassword } = body;
    const repo = connection.getRepository(User);

    const user = await repo.findOne({ id: currentUser.id });

    if (!(await UserModel.correctPassword(password, user.passwordHash)))
      return next(new AppError('Your current password is wrong', 401));

    const validation = validate(
      { password: newPassword, passwordConfirm },
      userConstraints.newPassword
    );
    if (validation) return next(new AppError(validation, 400));

    await repo
      .createQueryBuilder()
      .update()
      .set({ passwordHash: await UserModel.hashPassword(newPassword) })
      .where('id = :id', { id: user.id })
      .execute();

    createSendToken(user, 200, res);
  }
);

exports.signout = (req, res) => {
  res.cookie('jwt', 'logged-out', {
    ...cookieOptions,
    expires: new Date(Date.now() - 10000),
  });

  res.status(200).json({
    status: 'success',
  });
};
