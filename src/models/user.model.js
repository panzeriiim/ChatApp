const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: [
        true,
        'A user with that username already exists please choose different one',
      ],
      validate: {
        validator: function (v) {
          return /^[A-Za-z][A-Za-z0-9_]{7,14}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid username. Username must start with an alphabet follow by any digits, letters or _ and contain 8-15 characters`,
      },
    },
    email: {
      type: String,
      unique: [
        true,
        'A user with that email already exists please choose a different one',
      ],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z][\w]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid email. Please enter a valid email`,
      },
    },
    password: {
      type: String,
      minLength: [8, 'password must contain atleast 8 characters'],
    },
  },
  { timestamps: true }
);
userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async (password, userPassword) =>
  bcrypt.compare(password, userPassword);

module.exports = mongoose.model('User', userSchema);
