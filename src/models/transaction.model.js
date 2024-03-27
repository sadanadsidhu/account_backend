import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema(
  {
    accountHolderId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: false,
    },

    accountNumber: {
      type: Number,
      require: true,
    },

    transactionType: {
      type: String,
      require: true,
      enum: ['received', 'payment'],
    },
    amount: {
      type: Number,
      require: true,
    },
    remark: {
      type: String,
      require: true,
    },
    transactionDate: {
      type: Date,
      require: false,
    },
    transactionNo: {
      type: Number,
      default: 0,
    },
  },
  { timeseries: true },
);

// transactionSchema.statics.generateBillNumber = async function () {
//     const updatedTransaction = await this.findOneAndUpdate({}, { $inc: { transactionNo: 1 } }, { new: true });
//     console.log(updatedTransaction);
//     return updatedTransaction.transactionNo;
// };

transactionSchema.statics.generateBillNumber = async function () {
  let updatedTransaction = await this.findOne();
  if (!updatedTransaction) {
    // If no transaction found, initialize transactionNo to 1
    updatedTransaction = await this.create({});
  }
  updatedTransaction = await this.findOneAndUpdate(
    {},
    { $inc: { transactionNo: 1 } },
    { new: true },
  );
  return updatedTransaction.transactionNo;
};

export const Transaction = mongoose.model('Transaction', transactionSchema);
