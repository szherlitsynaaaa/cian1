import { AUCTION_GOALS } from './analytics'

type ScreenCardProps = {
  title: string
  subtitle: string
  role: 'Продавец' | 'Покупатель' | 'Общее'
  preview: string
  state?: 'default' | 'success' | 'error' | 'muted'
}

function ScreenCard({ title, subtitle, role, preview, state = 'default' }: ScreenCardProps) {
  return (
    <article className={`map-screen map-screen--${state}`}>
      <div className="map-screen__phone" aria-hidden="true">
        <div className="map-screen__bar"><i /><i /></div>
        <div className="map-screen__preview">
          <small>{preview}</small>
          <span /><span /><b />
        </div>
      </div>
      <div className="map-screen__copy">
        <span className="map-role">{role}</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <code>{AUCTION_GOALS.screenView}</code>
      </div>
    </article>
  )
}

function EventArrow({ goal, label }: { goal: string; label: string }) {
  return <div className="map-arrow"><span>→</span><div><code>{goal}</code><small>{label}</small></div></div>
}

export default function MapPage() {
  return (
    <main className="map-page">
      <header className="map-header">
        <div><p className="map-kicker">Прототип аукциона · карта сценариев</p><h1>Как продавец публикует лот, а покупатель делает ставку</h1></div>
        <a className="map-prototype-link" href="/">Открыть прототип <span>→</span></a>
      </header>

      <section className="map-note" aria-label="Принцип разметки">
        <span>Цель Метрики</span>
        <p>Каждая цель отправляется с параметрами <code>step</code> и <code>role</code>. Номер счётчика — заглушка <code>0</code>.</p>
      </section>

      <section className="scenario-map" aria-labelledby="map-title">
        <div className="section-heading"><p className="map-kicker">Карта экранов</p><h2 id="map-title">Все сценарии и состояния</h2></div>

        <div className="role-entry">
          <ScreenCard role="Общее" title="Выбор роли" subtitle="Стартовый экран" preview="Как участвовать?" />
          <div className="entry-events"><EventArrow goal={AUCTION_GOALS.roleSelected} label="выбрана роль продавца" /><EventArrow goal={AUCTION_GOALS.roleSelected} label="выбрана роль покупателя" /></div>
        </div>

        <div className="flow-lane flow-lane--seller">
          <div className="lane-label"><span>01</span><b>Сценарий продавца</b></div>
          <ScreenCard role="Продавец" title="Настройка аукциона" subtitle="Цена, шаг, дата" preview="Настройте аукцион" />
          <EventArrow goal={AUCTION_GOALS.sellerConditionsChecked} label="проверить условия" />
          <ScreenCard role="Продавец" title="Проверка условий" subtitle="Перед публикацией" preview="Проверьте условия" />
          <EventArrow goal={AUCTION_GOALS.auctionPublished} label="опубликовать аукцион" />
          <ScreenCard role="Продавец" title="Аукцион опубликован" subtitle="Лот доступен покупателям" preview="Квартира ждёт ставки" state="success" />
          <EventArrow goal={AUCTION_GOALS.auctionFinished} label="завершить аукцион" />
          <ScreenCard role="Продавец" title="Аукцион завершён" subtitle="Финальная ставка" preview="Приём ставок завершён" state="muted" />
        </div>
        <div className="lane-return"><code>{AUCTION_GOALS.sellerConditionsEdited}</code><span>← изменить условия</span></div>
        <div className="cross-flow"><span>↘</span><div><code>{AUCTION_GOALS.buyerLotOpened}</code><small>посмотреть карточку покупателя после публикации</small></div></div>

        <div className="flow-lane flow-lane--buyer">
          <div className="lane-label"><span>02</span><b>Сценарий покупателя</b></div>
          <ScreenCard role="Покупатель" title="Нет опубликованного лота" subtitle="До публикации" preview="Аукцион ещё не опубликован" state="muted" />
          <EventArrow goal={AUCTION_GOALS.buyerEmptyToSeller} label="перейти к настройке" />
          <ScreenCard role="Покупатель" title="Список аукционов" subtitle="Опубликованный лот" preview="Новая квартира на торгах" />
          <EventArrow goal={AUCTION_GOALS.buyerLotOpened} label="открыть карточку" />
          <ScreenCard role="Покупатель" title="Карточка квартиры" subtitle="Условия и форма ставки" preview="Сделать ставку" />
          <EventArrow goal={AUCTION_GOALS.bidSubmitted} label="отправить ставку" />
          <ScreenCard role="Покупатель" title="Проверяем ставку" subtitle="Загрузка" preview="Это займёт несколько секунд" state="muted" />
        </div>

        <div className="bid-outcomes">
          <div className="bid-outcomes__head"><span>Состояния формы ставки</span><p>Все остаются на карточке квартиры</p></div>
          <div className="bid-outcomes__items">
            <div><EventArrow goal={AUCTION_GOALS.bidBelowMinimum} label="сумма ниже минимума" /><ScreenCard role="Покупатель" title="Ставка ниже минимума" subtitle="Ошибка валидации" preview="Минимальная ставка" state="error" /></div>
            <div><EventArrow goal={AUCTION_GOALS.bidAccepted} label="ставка принята" /><ScreenCard role="Покупатель" title="Ставка принята" subtitle="Покупатель лидирует" preview="Ваша ставка лидирует" state="success" /></div>
            <div><EventArrow goal={AUCTION_GOALS.bidError} label="ошибка сервиса" /><ScreenCard role="Покупатель" title="Не удалось принять" subtitle="Можно повторить" preview="Попробуйте ещё раз" state="error" /></div>
            <div><EventArrow goal={AUCTION_GOALS.auctionFinished} label="аукцион завершён" /><ScreenCard role="Покупатель" title="Карточка: торги завершены" subtitle="Ставки закрыты" preview="Финальная ставка" state="muted" /></div>
          </div>
        </div>
      </section>

      <section className="metrics" aria-labelledby="metrics-title">
        <div className="section-heading"><p className="map-kicker">Проверка фичи</p><h2 id="metrics-title">Целевые продуктовые метрики</h2></div>
        <div className="metrics-table-wrap"><table className="metrics-table"><thead><tr><th>Показатель</th><th>Как считаем из целей</th><th>Условная цель</th></tr></thead><tbody>
          <tr><td><b>Конверсия в публикацию</b><span>Понятность настройки для продавца</span></td><td><code>unique(auction_published, role=seller) / unique(auction_role_selected, role=seller)</code></td><td><strong>≥ 35%</strong><small>за 14 дней после запуска</small></td></tr>
          <tr><td><b>Конверсия в ставку</b><span>Ценность лота для покупателя</span></td><td><code>unique(auction_bid_submitted, role=buyer) / unique(auction_buyer_lot_opened, role=buyer)</code></td><td><strong>≥ 12%</strong><small>среди открывших карточку</small></td></tr>
          <tr><td><b>Успешность отправки ставки</b><span>Надёжность сценария</span></td><td><code>auction_bid_accepted / auction_bid_submitted</code></td><td><strong>≥ 95%</strong><small>ошибок сервиса ≤ 5%</small></td></tr>
          <tr><td><b>Ликвидность аукциона</b><span>Есть ли спрос на опубликованные лоты</span></td><td><code>count(auction_bid_accepted) / count(auction_published)</code></td><td><strong>≥ 1,3</strong><small>принятой ставки на лот</small></td></tr>
        </tbody></table></div>
        <p className="metrics-footnote">В production к событиям стоит добавить <code>auction_id</code> и <code>user_id</code>: они позволят считать метрики по уникальным лотам и пользователям.</p>
      </section>
    </main>
  )
}
