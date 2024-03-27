import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';

const createUser = asyncHandler(async (req, res) => {
  const { username, phoneNumber, password } = req.body;

  // if ([username, email, password].some((field) => field?.trim() === "")) {
  //     throw new ApiError(400, "All fields are required")
  // }

  const existedUser = await User.findOne({
    $or: [{ username }, { phoneNumber }],
  });

  if (existedUser) {
    throw new ApiError(409, 'phone number or username already exists');
  }

  const user = await User.create({
    username: username.toLowerCase(),
    phoneNumber,
    password,
  });

  // remove the password and refresh token from user object
  const createUser = await User.findById(user._id).select('-password ');

  if (!createUser) {
    throw new ApiError(500, 'some went wrong wile user register');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, 'Admin register sucessfully '));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && (await user.isPasswordCorrect(password))) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user,
        },
        'Login Successfully',
      ),
    );
  } else {
    throw new ApiError(401, 'Invalid Credentials');
  }
});

// const logoutUser = asyncHandler(async (req, res) => {

//     const { _id } = req.user
//     const user = await User.findByIdAndUpdate(_id, { $set: { refreshToken: "" } }, { new: true });

//     if (!user) {
//         return res.status(404).json(new ApiResponse(404, "User not found"));
//     }
//     return res.status(200).json(new ApiResponse(200, "Logout successfully"));

// })

export {
  createUser,
  loginUser,
  // logoutUser,
};
