import { Router } from "express";
import {
  createAccount,
  getAccount,
  getAllAccount,
  deleteAccount,
  updateAccount
 
} from "../controllers/account.controller.js";


const router = Router()

router.route("/create").post(createAccount)
router.route("/get-all").get(getAllAccount)
router.route("/:accountNo").get(getAccount)
router.route("/update/:_id").put(updateAccount)
router.route("/delete/:_id").delete(deleteAccount)




export default router