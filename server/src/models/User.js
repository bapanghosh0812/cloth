import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    // bcrypt hash — never selected unless explicitly asked for (login only).
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => ({ id: String(ret._id), name: ret.name, email: ret.email, createdAt: ret.createdAt }),
});

export const User = mongoose.model('User', userSchema);
