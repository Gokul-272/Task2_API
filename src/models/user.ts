import mongoose,{ Schema} from "mongoose";
import type { User } from "../types.js";
import bcrypt from "bcrypt";
const userSchema = new Schema<User>({
  name: {
    type: String,
    required: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
},
{
    timestamps: true,
}
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

export const UserModel = mongoose.model<User>("User", userSchema);
