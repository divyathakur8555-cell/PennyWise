
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

function validatePeriod(month, year) {
  return (
    Number.isInteger(Number(month)) &&
    Number(month) >= 0 &&
    Number(month) <= 11 &&
    Number.isInteger(Number(year)) &&
    Number(year) >= 2000 &&
    Number(year) <= 2100
  );
}

// GET BUDGETS WITH ACTUAL SPENDING
export const getBudgets = async (req, res, next) => {
  try {
    const currentDate = new Date();

    const month = Number(
      req.query.month ?? currentDate.getMonth()
    );

    const year = Number(
      req.query.year ?? currentDate.getFullYear()
    );

    if (!validatePeriod(month, year)) {
      return res.status(400).json({
        message: "Invalid month or year.",
      });
    }

    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    }).sort({ category: 1 });

    // Aggregation pipelines do not automatically cast string IDs.
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          spent: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const expenseMap = Object.fromEntries(
      expenses.map((item) => [
        item._id,
        item.spent,
      ])
    );

    const result = budgets.map((budget) => {
      const spent = expenseMap[budget.category] || 0;
      const amount = budget.amount;
      const remaining = amount - spent;
      const percentage =
        amount > 0 ? (spent / amount) * 100 : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        alert:
          percentage >= 100
            ? "exceeded"
            : percentage >= 80
              ? "warning"
              : "normal",
      };
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

// CREATE OR UPDATE A BUDGET FOR A CATEGORY AND MONTH
export const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (
      typeof category !== "string" ||
      !category.trim() ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !validatePeriod(month, year)
    ) {
      return res.status(400).json({
        message: "Enter a valid category, positive amount, month and year.",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        category: category.trim(),
        month: Number(month),
        year: Number(year),
      },
      {
        $set: {
          amount: Number(amount),
        },
        $setOnInsert: {
          user: req.user.id,
          category: category.trim(),
          month: Number(month),
          year: Number(year),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Budget saved successfully.",
      budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A budget already exists for this category and month.",
      });
    }

    next(error);
  }
};

// EDIT AN EXISTING BUDGET
export const updateBudget = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Budget not found.",
      });
    }

    const { category, amount, month, year } = req.body;

    const updates = {};

    if (amount !== undefined) {
      if (
        amount === null ||
        amount === "" ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({
          message: "Budget amount must be greater than zero.",
        });
      }

      updates.amount = Number(amount);
    }

    if (category !== undefined) {
      if (
        typeof category !== "string" ||
        !category.trim()
      ) {
        return res.status(400).json({
          message: "Enter a valid category.",
        });
      }

      updates.category = category.trim();
    }

    if (month !== undefined) {
      updates.month = Number(month);
    }

    if (year !== undefined) {
      updates.year = Number(year);
    }

    if (
      (updates.month !== undefined || updates.year !== undefined)
    ) {
      const existing = await Budget.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!existing) {
        return res.status(404).json({
          message: "Budget not found.",
        });
      }

      const finalMonth = updates.month ?? existing.month;
      const finalYear = updates.year ?? existing.year;

      if (!validatePeriod(finalMonth, finalYear)) {
        return res.status(400).json({
          message: "Invalid month or year.",
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid budget changes were provided.",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found.",
      });
    }

    return res.json({
      message: "Budget updated successfully.",
      budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A budget already exists for that category and month.",
      });
    }

    next(error);
  }
};

// DELETE BUDGET
export const deleteBudget = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Budget not found.",
      });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found.",
      });
    }

    return res.json({
      message: "Budget deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
