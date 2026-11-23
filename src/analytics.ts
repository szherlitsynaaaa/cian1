export type MetrikaRole = 'seller' | 'buyer' | 'visitor'

type GoalParameters = {
  step: string
  role: MetrikaRole
  screen?: string
  result?: 'success' | 'error'
}

// Заглушка: замените на настоящий ID счётчика при подключении Метрики.
export const METRIKA_COUNTER_ID = 0

export const AUCTION_GOALS = {
  screenView: 'auction_screen_view',
  roleSelected: 'auction_role_selected',
  sellerConditionsChecked: 'auction_seller_conditions_checked',
  sellerConditionsInvalid: 'auction_seller_conditions_invalid',
  sellerConditionsEdited: 'auction_seller_conditions_edited',
  auctionPublished: 'auction_published',
  buyerEmptyToSeller: 'auction_buyer_empty_to_seller',
  buyerLotOpened: 'auction_buyer_lot_opened',
  buyerBackToList: 'auction_buyer_back_to_list',
  bidBelowMinimum: 'auction_bid_below_minimum',
  bidSubmitted: 'auction_bid_submitted',
  bidAccepted: 'auction_bid_accepted',
  bidError: 'auction_bid_error',
  auctionFinished: 'auction_finished',
} as const

declare global {
  interface Window {
    ym?: (counterId: number, action: 'reachGoal', goal: string, params: GoalParameters) => void
  }
}

/**
 * Одна точка отправки целей. При ID 0 ничего не уходит наружу: payload виден в консоли.
 */
export function reachMetrikaGoal(goal: string, params: GoalParameters) {
  if (METRIKA_COUNTER_ID > 0 && window.ym) {
    window.ym(METRIKA_COUNTER_ID, 'reachGoal', goal, params)
    return
  }

  console.info('[Metrika stub]', { counterId: METRIKA_COUNTER_ID, goal, params })
}
