import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 8, select: false },
    avatar: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
  },
  { collection: "users", timestamps: true },
);

//hashing password before saving user
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password =  bcrypt.hash(this.password, salt);
});

//compare password
userSchema.methods.comparePassword = async function (userPassword) {
  // console.log("Comparing passwords:", {
  //   userPassword,
  //   storedHash: this.password,
  // });
  // console.log(
  //   "bcrypt.compare result:",
  //   await bcrypt.compare(userPassword, this.password),
  // );
  return await bcrypt.compare(userPassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
