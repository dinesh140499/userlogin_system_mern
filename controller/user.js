const cloudinary = require("cloudinary").v2;
const User = require("../model/userSchema");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { sendOTPEmail, resetPasswordMail } = require("../utils/sendEmail");
const otpModel = require("../model/otpSchema");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "loveuashu9211@gmail.com",
//     pass: "Dinesh@140478",
//   },
// });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_SECRET,
});

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.emailOtpSend = async (req, res) => {
  const { email } = req.body;
  let otpgen = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  try {
    let userEmail = await otpModel.findOne({ email });
    if (userEmail) {
      if (userEmail.isVerified === true) {
        return res.status(208).json({
          success: true,
          message: "Email is Already Verified Try New With New Email",
        });
      }
      await userEmail.deleteOne({ _id: userEmail._id })

      await otpModel.create({ email, otp: otpgen, isVerified: false });
      sendOTPEmail(email, otpgen);

      res.status(200).json({
        success: true,
        message: "Otp Sent To Your Email",
      });
    } else {

      await otpModel.create({ email, otp: otpgen, isVerified: false });
      sendOTPEmail(email, otpgen);

      res.status(200).json({
        success: true,
        message: "Otp Sent To Your Email",
      });
    }

    // if (!userEmail.otp) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Otp is not exist",
    //   });
    // }

    // console.log("otp is sent ", userEmail)
    // let store = await userEmail.deleteOne({ _id: userEmail._id })
    // console.log('otp updated', store)

    // await otpModel.create({ email, otp: otpgen, isVerified: false });
    // sendOTPEmail(email, otpgen);

    // res.status(400).json({
    //   success: true,
    //   message: "Otp Sent To Your Email",
    // });
  } catch (error) {
    console.log(error)
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, age, password, confirmPassword, photo } = req.body;

    const userEmailCheck = await User.findOne({ email });

    const existEmail = await otpModel.findOne({ email });

    if (userEmailCheck) {
      return res.status(400).json({
        success: false,
        message: "User Already Exist",
      });
    }

    if (!existEmail) {
      return res.status(400).json({
        success: false,
        message: "Verify Your Email First",
      });
    }

    if (existEmail.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: "User is not verified",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirm password doesn't match",
      });
    }

    const file = req.files.photo;
    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
      if (result) {
        const user = await User.create({
          name,
          email,
          age,
          password,
          photo: {
            public_id: result.public_id,
            uri: result.url,
          },
        });
        res.status(201).json({
          success: true,
          user,
          message: "User Created",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "field cannot be blank",
    });
  }

  const isMatch = await otpModel.findOne({ email });
  // console.log(isMatch.otp)

  if (!isMatch) {
    return res.status(400).json({ error: "OTP not found" });
  }


  if (isMatch.isVerified === true) {
    return res.status(400).json({ error: "Email Already Registered" });
  }


  if (isMatch.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  await otpModel.findOneAndUpdate({ email }, { isVerified: true });

  res
    .json({
      success: true,
      message: "Otp verified",
    })
    .status(202);
};

exports.updateUser = async (req, res) => {
  try {
    const { name, age } = req.body;
    const id = req.params.id;
    if (!name || !age) {
      return res.status(400).json({
        message: "Please Enter Name & Age",
      });
    }

    let user = await User.findByIdAndUpdate(id, { name, age });
    res.status(201).json({
      message: "details updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    let user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User Delete",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "You cannot field blank",
      });
    }
    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id & password",
      });
    }

    let isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id & password",
      });
    }

    let token = jwt.sign({ _id: user._id }, process.env.JWTSECRET);

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(202).json({
      success: true,
      message: "Welcome To Your Profile",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.json({
      message: "you are logout successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      let rndString = randomstring.generate();
      await User.updateOne({ email }, { $set: { token: rndString } });
      resetPasswordMail(user.email, rndString);

      res.status(200).json({
        message: "Reset Password has been sent to your email.",
        success: true,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User is not exist",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.query;

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password Should Be Greater Then 8 Character",
      });
    }

    const tokenExist = await User.findOne({ token }).select("+password");

    if (!tokenExist) {
      return res.status(400).json({
        success: false,
        message: "Token Expired",
      });
    }

    let encryptPassword = await bcrypt.hash(password, 10);
    const userUpdate = await User.findByIdAndUpdate(
      { _id: tokenExist._id },
      { $set: { password: encryptPassword, token: "" } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
