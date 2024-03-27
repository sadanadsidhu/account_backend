import { Router } from 'express';
import {
  createTransaction,
  getAllTransaction,
  updateTransaction,
  deleteTransaction,
  transactionReport,
  // updateTransactionReport,
} from '../controllers/transaction.controller.js';

const router = Router();

router.route('/create').post(createTransaction);
router.route('/get-all').get(getAllTransaction);
router.route('/update/:_id').put(updateTransaction);
router.route('/delete/:_id').delete(deleteTransaction);
router.route('/report').get(transactionReport);
// router.route('/report/:reportId').put(updateTransactionReport);
export default router;
