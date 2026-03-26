import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required() {
        return this.authProvider === "local";
      },
      minLength: 8,
      select: false,
    },
    avatar: { type: String, default: "" },
    firebaseUid: { type: String, unique: true, sparse: true },
    refreshToken: { type: String, default: "", select: false },
    authProvider: {
      type: String,
      enum: ["local", "firebase"],
      default: "local",
    },
  },
  { collection: "users", timestamps: true },
);

//hashing password before saving user
userSchema.pre("save", async function () {
  if (this.authProvider !== "local" || !this.isModified("password") || !this.password) {
    return;
  }

  if (/^\$2[aby]\$/.test(this.password)) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
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
