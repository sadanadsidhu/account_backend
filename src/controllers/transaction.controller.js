import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Account } from '../models/account.model.js';
import { Transaction } from '../models/transaction.model.js';
import { TransactionUpdateType } from '../constants.js';

const generatedBillNo = async () => {
  return await Transaction.generateBillNumber();
};

const createTransaction = asyncHandler(async (req, res) => {
  const { accountHolderId, transactionType, amount, transactionDate, remark } =
    req.body;

  const transactionNo = await generatedBillNo();

  const account = await Account.findById({ _id: accountHolderId });

  if (!account) {
    throw new ApiError(409, 'account not found');
  }

  if (transactionType === 'received') {
    const savingTansactions = await Transaction.create({
      accountHolderId,
      accountNumber: account.accountNumber,
      transactionType,
      amount,
      transactionDate,
      remark,
      transactionNo,
    });
    account.closingBalance = account.closingBalance + amount;
    await account.save();

    return res.status(201).json(
      new ApiResponse(
        200,
        {
          transaction: savingTansactions,
          account: account,
        },
        'transaction complited',
      ),
    );
  } else if (transactionType === 'payment') {
    if (account.closingBalance >= amount) {
      const withDrawTansactions = await Transaction.create({
        accountHolderId,
        accountNumber: account.accountNumber,
        transactionType,
        amount,
        transactionDate,
        remark,
        transactionNo,
      });
      account.closingBalance = account.closingBalance - amount;
      await account.save();

      return res.status(201).json(
        new ApiResponse(
          200,
          {
            transaction: withDrawTansactions,
            account: account,
          },
          'transaction complited',
        ),
      );
    }
    return res.status(201).json(new ApiResponse(200, 'Insuficent blance'));
  }
});

const getAllTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.find({}).sort({ _id: -1 });

  if (transaction.length > 0) {
    return res
      .status(201)
      .json(new ApiResponse(200, transaction, 'all transaction'));
  }
  return res.status(201).json(new ApiResponse(200, 'Data not found'));
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const transaction = await Transaction.findById(_id);
  if (!transaction) {
    return res.status(201).json(new ApiResponse(500, 'transaction not found'));
  }
  const deleteTransaction = await Transaction.findByIdAndDelete(_id);

  if (deleteTransaction) {
    const { closingBalance } = await Account.findOne({
      accountNumber: transaction.accountNumber,
    });

    if (transaction.transactionType === 'payment') {
      await Account.updateOne(
        { accountNumber: transaction.accountNumber },
        {
          $set: {
            closingBalance: closingBalance + transaction.amount,
          },
        },
        { new: true },
      );
    } else if (transaction.transactionType === 'received') {
      await Account.updateOne(
        { accountNumber: transaction.accountNumber },
        {
          $set: {
            closingBalance: closingBalance - transaction.amount,
          },
        },
        { new: true },
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(400, '', 'transaction deleted sucessfully'));
  }
  throw new ApiError(500, 'some went wrong');
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const {
    accountType,
    transactionType,
    accountNo,
    amount,
    transactionDate,
    remark,
    updateType,
  } = req.body;

  const existingTransaction = await Transaction.findOne(_id);
  if (!existingTransaction) {
    return res.status(201).json(new ApiResponse(500, 'transaction not found'));
  }

  if (updateType === TransactionUpdateType.accountNo) {
    // first reverese the amount from previous account
    await Account.updateOne(
      { _id: existingTransaction.accountHolderId },
      {
        $set: {
          closingBalance: closingBalance - existingTransaction.amount,
        },
      },
      { new: true },
    );

    // add the amount of new account number
    const newAccounts = await Account.findOne({ _id: accountNo });
    if (newAccounts) {
      if (existingTransaction.accountType === 'recived') {
        await Account.updateOne(
          { _id: newAccount._id },
          {
            $set: {
              closingBalance: closingBalance + existingTransaction.amount,
            },
          },
          {
            new: true,
          },
        );
      } else if (existingTransaction.accountType === 'payment') {
        await Account.updateOne(
          { _id: newAccount._id },
          {
            $set: {
              closingBalance: closingBalance - existingTransaction.amount,
            },
          },
          {
            new: true,
          },
        );
      }
    }

    // update the exesisiting transactions in account number
    await Transaction.findByIdAndUpdate(
      _id,
      {
        $set: {
          accountNumber: accountNo,
        },
      },
      { new: true },
    );
  } else if (updateType === TransactionUpdateType.transactionType) {
    // first update amount on accounts
    if (transactionType === 'reacived') {
      await Account.updateOne(
        { _id: existingTransaction.accountHolderId },
        {
          $set: {
            closingBalance: closingBalance + existingTransaction.amount,
          },
        },
        {
          new: true,
        },
      );
    } else if (transactionType === 'reacived') {
      await Account.updateOne(
        { _id: existingTransaction.accountHolderId },
        {
          $set: {
            closingBalance: closingBalance - existingTransaction.amount,
          },
        },
        {
          new: true,
        },
      );
    }

    // after that update the transaction
  } else if (updateType === TransactionUpdateType.amount) {
    // if ammount is grate
  }

  return res.status(201).json(new ApiResponse(400, 'some thing went rong'));
});

const transactionReport = asyncHandler(async (req, res) => {
  const transaction = await Transaction.find({})
    .populate('accountHolderId')
    .sort({ _id: -1 });

  if (transaction.length > 0) {
    return res
      .status(201)
      .json(new ApiResponse(201, transaction, 'All transaction reports'));
  }
  throw new ApiError(500, 'No data found');
});

// const updateTransactionReport = asyncHandler(async (req, res) => {
//   const { reportId } = req.body;

//   if (!reportId) {
//     throw new ApiError(400, 'Missing reportId');
//   }

//   const updatedReport = await Transaction.findByIdAndUpdate(reportId, newData, {
//     new: true,
//   });

//   if (updatedReport) {
//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           updatedReport,
//           'Transaction report updated successfully',
//         ),
//       );
//   } else {
//     throw new ApiError(404, 'Transaction report not found');
//   }
// });

export {
  createTransaction,
  getAllTransaction,
  updateTransaction,
  deleteTransaction,
  transactionReport,
};
