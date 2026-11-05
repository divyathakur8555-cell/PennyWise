
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";

const types = ["income", "expense"];

function validDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) ? date : null;
}

function validateTransaction(data) {
  const { title, amount, type, category, date, notes } = data;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    !types.includes(type) ||
    amount === undefined ||
    amount === null ||
    amount === "" ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return "Enter a valid title, category, type and positive amount.";
  }

  if (date !== undefined && date !== null && date !== "") {
    if (!validDate(date)) {
      return "Please enter a valid transaction date.";
    }
  }

  if (notes !== undefined && typeof notes !== "string") {
    return "Notes must be text.";
  }

  return null;
}

// GET ALL TRANSACTIONS
export async function getAll(req, res, next) {
  try {
    const filter = { user: req.user.id };

    const { type, category, startDate, endDate } = req.query;

    if (type && types.includes(type)) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const start = validDate(`${startDate}T00:00:00.000Z`);

        if (!start) {
          return res.status(400).json({
            message: "Invalid start date.",
          });
        }

        filter.date.$gte = start;
      }

      if (endDate) {
        const end = validDate(`${endDate}T23:59:59.999Z`);

        if (!end) {
          return res.status(400).json({
            message: "Invalid end date.",
          });
        }

        filter.date.$lte = end;
      }

      if (
        filter.date.$gte &&
        filter.date.$lte &&
        filter.date.$gte > filter.date.$lte
      ) {
        return res.status(400).json({
          message: "Start date cannot be after end date.",
        });
      }
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 });

    return res.json(transactions);
  } catch (error) {
    next(error);
  }
}

// CREATE TRANSACTION
export async function create(req, res, next) {
  try {
    const error = validateTransaction(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const { title, amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      user: req.user.id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: date ? validDate(date) : new Date(),
      notes: notes?.trim() || "",
    });

    return res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
}

// UPDATE TRANSACTION
export async function update(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    const error = validateTransaction(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const {
      title,
      amount,
      type,
      category,
      date,
      notes,
    } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    transaction.title = title.trim();
    transaction.amount = Number(amount);
    transaction.type = type;
    transaction.category = category.trim();

    if (date) {
      transaction.date = validDate(date);
    }

    transaction.notes = notes?.trim() || "";

    await transaction.save();

    return res.json(transaction);
  } catch (error) {
    next(error);
  }
}

// DELETE TRANSACTION
export async function remove(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    return res.json({
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// EXPORT PDF REPORT
export async function pdf(req, res, next) {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    }).sort({ date: -1 });

    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const balance = income - expenses;

    const document = new PDFDocument({
      margin: 45,
      size: "A4",
      bufferPages: true,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="finance-report.pdf"'
    );

    document.on("error", (error) => {
      if (!res.headersSent) {
        next(error);
      } else {
        res.destroy(error);
      }
    });

    document.pipe(res);

    document
      .fontSize(22)
      .text("Personal Finance Report", { align: "center" });

    document.moveDown();

    document.fontSize(11);

    document.text(`Generated: ${new Date().toLocaleDateString()}`);
    document.text(`Total Income: ${income.toFixed(2)}`);
    document.text(`Total Expenses: ${expenses.toFixed(2)}`);
    document.text(`Current Balance: ${balance.toFixed(2)}`);

    document.moveDown();

    document
      .fontSize(15)
      .text("Transaction History");

    document.moveDown(0.5);

    document.fontSize(9);

    if (transactions.length === 0) {
      document.text("No transactions found.");
    } else {
      transactions.forEach((item, index) => {
        if (document.y > 735) {
          document.addPage();
        }

        const line =
          `${index + 1}. ` +
          `${new Date(item.date).toLocaleDateString()} | ` +
          `${item.type.toUpperCase()} | ` +
          `${item.title} | ` +
          `${item.category} | ` +
          `${Number(item.amount).toFixed(2)}`;

        document.text(line, {
          width: 500,
        });
      });
    }

    document.end();
  } catch (error) {
    next(error);
  }
}
