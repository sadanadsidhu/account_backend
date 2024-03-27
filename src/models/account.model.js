import mongoose, { Schema } from 'mongoose';

const accountSchena = new Schema(
  {
    accountNumber: {
      type: Number,
      require: true,
    },

    accountType: {
      type: String,
      enum: ['saving', 'current'],
      default: 'saving',
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    careOf: {
      type: String,
      require: false,
    },
    address: {
      type: String,
      require: false,
    },
    aadharNo: {
      type: Number,
      require: true,
    },
    mobileNo: {
      type: Number,
      require: false,
    },
    // openingBalance: {
    //     type: Number,
    //     require: true,
    // },
    panNo: {
      type: String,
      require: false,
    },
    schemeType: {
      type: String,
      required: false,
    },
    planName: {
      type: Number,
      required: false,
    },
    customerId: {
      type: String,
      required: false,
    },
    openingDate: {
      type: Date,
      required: false,
    },
    installmentAmt: {
      type: Number,
      required: false,
    },
    period: {
      type: Number,
      required: false,
    },
    periodInterest: {
      type: Number,
      required: false,
    },
    depositAmount: {
      type: Number,
      required: false,
    },
    depositInterest: {
      type: Number,
      required: false,
    },
    maturity: {
      type: Date,
      required: false,
    },
    maturityAmount: {
      type: Number,
      required: false,
    },
    openingBalance: {
      type: Number,
      required: false,
    },
    closingBalance: {
      type: Number,
      require: false,
    },
  },
  { timeseries: true },
);

export const Account = mongoose.model('Account', accountSchena);
