import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import type { Category } from "@/lib/supabase"

interface TransactionButtonsProps {
  incomeCategories: Category[]
  expenseCategories: Category[]
}

export function TransactionButtons({ incomeCategories, expenseCategories }: TransactionButtonsProps) {
  return (
    <div className="flex gap-3 mt-4 sm:mt-0">
      <AddTransactionDialog type="expense" categories={expenseCategories} />
      <AddTransactionDialog type="income" categories={incomeCategories} />
      <AddCategoryDialog />
    </div>
  )
}

