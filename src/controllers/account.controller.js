import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Account } from '../models/account.model.js';
import { Transaction } from '../models/transaction.model.js';

const generatedBillNo = async () => {
  return await Transaction.generateBillNumber();
};

const createAccount = asyncHandler(async (req, res) => {
  const {
    accountNumber,
    accountType,
    name,
    careOf,
    address,
    aadharNo,
    mobileNo,
    panNo,
    schemeType,
    planName,
    customerId,
    openingDate,
    installmentAmt,
    period,
    periodInterest,
    depositAmount,
    depositInterest,
    maturity,
    maturityAmount,
    openingBalance,
  } = req.body;

  const exsAcconnt = await Account.findOne({
    $or: [{ accountNumber }, { mobileNo }],
  });

  if (exsAcconnt) {
    throw new ApiError(409, 'Account Number and phone number alradey exesis');
  }

  const account = await Account.create({
    accountNumber,
    accountType,
    name,
    careOf,
    address,
    aadharNo,
    mobileNo,
    panNo,
    schemeType,
    planName,
    customerId,
    openingDate,
    installmentAmt,
    period,
    periodInterest,
    depositAmount,
    depositInterest,
    maturity,
    maturityAmount,
    openingBalance,
    closingBalance: openingBalance,
  });

  if (account) {
    const transactionNo = await generatedBillNo();

    await Transaction.create({
      accountHolderId: account._id,
      accountNumber: account.accountNumber,
      transactionType: 'received',
      amount: openingBalance,
      remark: 'account opening',
      transactionNo,
    });

    return res
      .status(201)
      .json(new ApiResponse(200, account, 'Account create sucessfully '));
  } else {
    throw new ApiError(500, 'some went wrong');
  }
});

const getAccount = asyncHandler(async (req, res) => {
  const { accountNo } = req.params;

  const account = await Account.findOne({ accountNumber: accountNo });

  if (account) {
    return res.status(200).json(new ApiResponse(200, account));
  }

  throw new ApiError(500, 'No data found');
});

const getAllAccount = asyncHandler(async (req, res) => {
  const account = await Account.find({}).sort({ data: -1 });

  if (account.length > 0) {
    return res.status(201).json(new ApiResponse(200, account, 'all account'));
  }
  return res.status(201).json(new ApiResponse(200, 'Data not found'));
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const account = await Account.findById(_id);
  if (!account) {
    return res.status(201).json(new ApiResponse(500, 'account not found'));
  }

  const deleteAaccount = await Account.findByIdAndDelete(_id);

  if (deleteAaccount) {
    return res
      .status(201)
      .json(new ApiResponse(400, deleteAaccount, '  deleted sucessfully'));
  }
  throw new ApiError(500, 'some went wrong wile user register');
});

const updateAccount = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const {
    accountNumber,
    accountType,
    name,
    address,
    aadharNo,
    mobileNo,
    openingBalance,
    closingBalance,
  } = req.body;

  const account = await Account.findById(_id);
  if (!account) {
    return res.status(201).json(new ApiResponse(500, 'account not found'));
  }

  const accountTransaction = await Account.findByIdAndUpdate(
    _id,
    {
      accountNumber,
      accountType,
      name,
      address,
      aadharNo,
      mobileNo,
      openingBalance,
      closingBalance,
    },
    {
      new: true,
    },
  );

  if (accountTransaction) {
    return res
      .status(201)
      .json(
        new ApiResponse(400, accountTransaction, 'update Account sucessfully'),
      );
  }
  return res.status(201).json(new ApiResponse(400, 'some thing went rong'));
});

export {
  createAccount,
  getAccount,
  getAllAccount,
  deleteAccount,
  updateAccount,
};
