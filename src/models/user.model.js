import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },
        phoneNumber: {
            type: Number,
            require: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },
       
        password: {
            type: String,
            required: [true, 'Password is required']
        },
    
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password)
}




export const User = mongoose.model("User", userSchema);