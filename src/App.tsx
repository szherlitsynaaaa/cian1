import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AUCTION_GOALS, MetrikaRole, reachMetrikaGoal } from './analytics'

type Role = 'seller' | 'buyer'
type AuctionStatus = 'draft' | 'published' | 'finished'
type SellerScreen = 'setup' | 'review' | 'published'
type BuyerScreen = 'feed' | 'card'
type BidStatus = 'idle' | 'below-minimum' | 'pending' | 'accepted' | 'error'
type DemoResponse = 'accepted' | 'error'

type Auction = {
  status: AuctionStatus
  startPrice: number
  currentPrice: number
  step: number
  endDate: string
}

const INITIAL_AUCTION: Auction = {
  status: 'draft',
  startPrice: 10_000_000,
  currentPrice: 10_000_000,
  step: 100_000,
  endDate: '2026-12-01',
}

const apartment = {
  title: '2-комн. квартира, 58,4 м²',
  address: 'Москва, ул. Большая Дмитровка, 12',
  features: ['8 этаж из 12', 'Кирпичный дом', 'Рядом с метро'],
}

const formatPrice = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(`${value}T12:00:00`))

function Arrow({ direction = 'right' }: { direction?: 'left' | 'right' }) {
  return <span className={`arrow arrow--${direction}`} aria-hidden="true">→</span>
}

function BuildingArtwork() {
  return (
    <div className="building-artwork" aria-label="Изображение квартиры" role="img">
      <svg viewBox="0 0 320 200" aria-hidden="true">
        <rect width="320" height="200" rx="24" fill="#0B2147" />
        <path d="M0 200L88 61H232L320 200H0Z" fill="#FF631A" />
        <path d="M47 200L112 69H208L273 200H47Z" fill="#FFBE16" />
        <rect x="82" y="43" width="156" height="127" rx="18" fill="#fff" />
        <path d="M82 61C82 51.059 90.059 43 100 43H220C229.941 43 238 51.059 238 61V76H82V61Z" fill="#1158F9" />
        <rect x="96" y="86" width="128" height="58" rx="9" fill="#EAF1FF" />
        <path d="M96 126H224V144H96V126Z" fill="#F9D9A4" /><path d="M103 136H217" stroke="#DDAA68" strokeWidth="2" opacity=".7" />
        <rect x="104" y="93" width="27" height="28" rx="3" fill="#fff" /><path d="M117.5 93V121M104 107H131" stroke="#AFCBFF" strokeWidth="2" />
        <path d="M150 112C150 103.163 157.163 96 166 96H184C192.837 96 200 103.163 200 112V126H150V112Z" fill="#5B89E8" /><rect x="154" y="111" width="17" height="7" rx="3.5" fill="#FFBE16" /><rect x="176" y="111" width="17" height="7" rx="3.5" fill="#fff" opacity=".82" />
        <rect x="207" y="104" width="4" height="22" rx="2" fill="#7C5639" /><circle cx="209" cy="99" r="8" fill="#7ECF7A" />
        <rect x="101" y="150" width="76" height="11" rx="5.5" fill="#1158F9" /><rect x="181" y="150" width="29" height="11" rx="5.5" fill="#D9E8FF" />
        <path d="M111 57H173" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><path d="M182 57H208" stroke="#AFCBFF" strokeWidth="5" strokeLinecap="round" />
        <circle cx="251" cy="35" r="15" fill="#FFBE16" /><circle cx="55" cy="36" r="8" fill="#1158F9" />
      </svg>
    </div>
  )
}

function AuctionEmptyArtwork() {
  return (
    <svg className="empty-state__artwork" viewBox="0 0 240 166" role="img" aria-label="Аукцион готовится к публикации">
      <rect x="8" y="8" width="224" height="150" rx="26" fill="#0B2147" />
      <path d="M31 145L82 66H158L210 145H31Z" fill="#FF631A" /><path d="M52 145L93 75H148L190 145H52Z" fill="#FFBE16" />
      <rect x="55" y="25" width="130" height="111" rx="19" fill="#1158F9" />
      <path d="M72 47H124" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><path d="M133 47H163" stroke="#AFCBFF" strokeWidth="5" strokeLinecap="round" />
      <rect x="70" y="65" width="100" height="56" rx="12" fill="#fff" /><rect x="77" y="72" width="86" height="42" rx="7" fill="#EAF1FF" />
      <rect x="84" y="78" width="18" height="21" rx="2" fill="#fff" /><path d="M93 78V99M84 88H102" stroke="#AFCBFF" strokeWidth="1.5" />
      <path d="M77 103H163V114H77V103Z" fill="#F9D9A4" /><path d="M108 98C108 92.477 112.477 88 118 88H135C140.523 88 145 92.477 145 98V104H108V98Z" fill="#5B89E8" />
      <circle cx="147" cy="96" r="15" fill="#0B2147" /><path d="M147 87V96L153 100" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="31" r="8" fill="#FFBE16" /><circle cx="204" cy="42" r="7" fill="#FF631A" />
    </svg>
  )
}

function CianLogo() {
  return (
    <svg className="cian-logo" viewBox="0 0 1436 364" role="img" aria-label="Циан">
      <path fill="#0d162e" d="M610.298 363.888H669.212V255.681H639.264V28.8359H576.914V255.681H450.251V28.8359H387.901V307.348H610.298V363.888ZM707.996 307.348H766.418L856.261 168.092V307.348H914.683V85.4241H856.261L766.418 224.68V85.4241H707.996V307.348ZM1049.2 311.284C1102.71 311.284 1140.52 263.554 1140.52 196.14C1140.52 128.726 1102.71 81.4875 1049.2 81.4875C991.761 81.4875 951.504 128.726 951.504 196.14C951.504 263.554 991.761 311.284 1049.2 311.284ZM1064.91 263.062C1032.02 263.062 1011.4 237.474 1011.4 196.14C1011.4 155.298 1032.02 129.71 1064.91 129.71C1098.3 129.71 1118.91 155.298 1118.91 196.14C1118.91 237.474 1098.3 263.062 1064.91 263.062ZM1126.28 85.4241L1118.91 149.885V242.887L1126.28 307.348H1177.34V85.4241H1126.28ZM1226.43 307.348H1284.85V213.855H1376.66V307.348H1435.08V85.4241H1376.66V165.632H1284.85V85.4241H1226.43V307.348Z" />
      <path fill="#006cfd" d="M294.527 60.3463C294.527 74.2313 289.721 89.7184 271.564 107.876L235.249 144.19L198.934 107.876C180.777 89.7184 175.971 74.2313 175.971 60.3463C175.971 26.1679 201.071 0 235.249 0C269.427 0 294.527 26.1679 294.527 60.3463Z" />
      <path fill="#006cfd" d="M294.789 259.949L238.715 316.023L147.395 224.703L56.074 316.023L0 259.949L147.395 112.555L294.789 259.949Z" />
    </svg>
  )
}

function RoleQuiz({ selectedRole, onSelect, onContinue }: { selectedRole: Role | null; onSelect: (role: Role) => void; onContinue: () => void }) {
  const roles: Array<{ id: Role; title: string; text: string; icon: string }> = [
    { id: 'seller', title: 'Я продаю квартиру', text: 'Настрою условия и опубликую аукцион', icon: '⌂' },
    { id: 'buyer', title: 'Я покупаю квартиру', text: 'Посмотрю лот и сделаю ставку', icon: '₽' },
  ]

  return <section className="role-quiz">
    <div className="quiz-progress"><span className="quiz-progress__back">←</span><i /><i /><i /></div>
    <p className="eyebrow">Первый шаг</p>
    <h1>Как вы хотите участвовать?</h1>
    <p className="muted">Выберите роль — в любой момент её можно будет изменить.</p>
    <div className="role-options" role="radiogroup" aria-label="Роль в аукционе">
      {roles.map((option) => <button key={option.id} className={`role-option ${selectedRole === option.id ? 'role-option--selected' : ''}`} role="radio" aria-checked={selectedRole === option.id} onClick={() => onSelect(option.id)}>
        <span className="role-option__icon" aria-hidden="true">{option.icon}</span>
        <span className="role-option__copy"><b>{option.title}</b><small>{option.text}</small></span>
        <span className="role-option__radio" aria-hidden="true" />
      </button>)}
    </div>
    <div className="quiz-footer"><button className="primary-button" disabled={!selectedRole} onClick={onContinue}>Продолжить <Arrow /></button></div>
  </section>
}

function App() {
  const [role, setRole] = useState<Role>('seller')
  const [auction, setAuction] = useState<Auction>(INITIAL_AUCTION)
  const [sellerScreen, setSellerScreen] = useState<SellerScreen>('setup')
  const [buyerScreen, setBuyerScreen] = useState<BuyerScreen>('feed')
  const [startPrice, setStartPrice] = useState(String(INITIAL_AUCTION.startPrice))
  const [step, setStep] = useState(String(INITIAL_AUCTION.step))
  const [endDate, setEndDate] = useState(INITIAL_AUCTION.endDate)
  const [formError, setFormError] = useState('')
  const [bidValue, setBidValue] = useState('')
  const [bidStatus, setBidStatus] = useState<BidStatus>('idle')
  const [demoResponse, setDemoResponse] = useState<DemoResponse>('accepted')
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [isRoleQuizOpen, setIsRoleQuizOpen] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const minimumBid = auction.currentPrice + auction.step
  const isPublished = auction.status === 'published'
  const isFinished = auction.status === 'finished'
  const numericBid = Number(bidValue.replace(/\s/g, ''))
  const bidHint = bidValue && numericBid < minimumBid
    ? `Минимальная ставка — ${formatPrice(minimumBid)}`
    : ''

  const progress = useMemo(() => {
    if (auction.status === 'draft') return 0
    if (auction.status === 'published') return 2
    return 3
  }, [auction.status])

  const currentScreen = isRoleQuizOpen
    ? 'role-choice'
    : role === 'seller'
      ? `seller-${sellerScreen}-${auction.status}`
      : auction.status === 'draft'
        ? 'buyer-empty'
        : `buyer-${buyerScreen}-${auction.status}${buyerScreen === 'card' ? `-${bidStatus}` : ''}`

  useEffect(() => {
    reachMetrikaGoal(AUCTION_GOALS.screenView, {
      step: currentScreen,
      role: isRoleQuizOpen ? 'visitor' : role,
      screen: currentScreen,
    })
  }, [currentScreen, isRoleQuizOpen, role])

  const checkAuction = (event: FormEvent) => {
    event.preventDefault()
    const nextStartPrice = Number(startPrice)
    const nextStep = Number(step)
    if (!nextStartPrice || !nextStep || !endDate || nextStep <= 0) {
      setFormError('Заполните цену, шаг ставки и дату окончания.')
      reachMetrikaGoal(AUCTION_GOALS.sellerConditionsInvalid, { step: 'seller-setup', role: 'seller', result: 'error' })
      return
    }
    if (nextStep >= nextStartPrice) {
      setFormError('Шаг ставки должен быть меньше стартовой цены.')
      reachMetrikaGoal(AUCTION_GOALS.sellerConditionsInvalid, { step: 'seller-setup', role: 'seller', result: 'error' })
      return
    }
    setFormError('')
    setAuction((current) => ({
      ...current,
      startPrice: nextStartPrice,
      currentPrice: nextStartPrice,
      step: nextStep,
      endDate,
    }))
    setSellerScreen('review')
    reachMetrikaGoal(AUCTION_GOALS.sellerConditionsChecked, { step: 'seller-setup', role: 'seller', result: 'success' })
  }

  const publishAuction = () => {
    setAuction((current) => ({ ...current, status: 'published' }))
    setSellerScreen('published')
    reachMetrikaGoal(AUCTION_GOALS.auctionPublished, { step: 'seller-review', role: 'seller', result: 'success' })
  }

  const submitBid = (event: FormEvent) => {
    event.preventDefault()
    if (!numericBid || numericBid < minimumBid) {
      setBidStatus('below-minimum')
      reachMetrikaGoal(AUCTION_GOALS.bidBelowMinimum, { step: 'buyer-card', role: 'buyer', result: 'error' })
      return
    }
    setBidStatus('pending')
    reachMetrikaGoal(AUCTION_GOALS.bidSubmitted, { step: 'buyer-card', role: 'buyer' })
    window.setTimeout(() => {
      if (demoResponse === 'error') {
        setBidStatus('error')
        reachMetrikaGoal(AUCTION_GOALS.bidError, { step: 'buyer-card', role: 'buyer', result: 'error' })
        return
      }
      setAuction((current) => ({ ...current, currentPrice: numericBid }))
      setBidStatus('accepted')
      reachMetrikaGoal(AUCTION_GOALS.bidAccepted, { step: 'buyer-card', role: 'buyer', result: 'success' })
    }, 900)
  }

  const selectRole = (nextRole: Role, step = 'role-choice') => {
    setRole(nextRole)
    if (nextRole === 'buyer' && auction.status !== 'draft') setBuyerScreen('feed')
    reachMetrikaGoal(AUCTION_GOALS.roleSelected, { step, role: nextRole })
  }

  const openRoleQuiz = (nextRole: Role = role) => {
    setSelectedRole(nextRole)
    setIsRoleQuizOpen(true)
  }

  const confirmRole = () => {
    if (!selectedRole) return
    selectRole(selectedRole)
    setIsRoleQuizOpen(false)
  }

  const goToSellerSetup = () => {
    setRole('seller')
    setSellerScreen('setup')
    setIsRoleQuizOpen(false)
    reachMetrikaGoal(AUCTION_GOALS.buyerEmptyToSeller, { step: 'buyer-empty', role: 'buyer' })
  }

  const goToBuyerCard = () => {
    setRole('buyer')
    setBuyerScreen('card')
    setIsRoleQuizOpen(false)
    reachMetrikaGoal(AUCTION_GOALS.buyerLotOpened, { step: 'seller-published', role: 'buyer' })
  }

  const resetDemo = () => {
    setAuction(INITIAL_AUCTION)
    setStartPrice(String(INITIAL_AUCTION.startPrice))
    setStep(String(INITIAL_AUCTION.step))
    setEndDate(INITIAL_AUCTION.endDate)
    setSellerScreen('setup')
    setBuyerScreen('feed')
    setBidValue('')
    setBidStatus('idle')
    setRole('seller')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <CianLogo />
        </div>
        <div className="topbar__actions"><a className="map-link" href="/map">Карта</a><button className="role-change" onClick={() => openRoleQuiz()}><span>Роль</span><b>{role === 'seller' ? 'Продавец' : 'Покупатель'}</b><i>↔</i></button></div>
      </header>

      {isRoleQuizOpen ? <RoleQuiz selectedRole={selectedRole} onSelect={setSelectedRole} onContinue={confirmRole} /> : <>
        <section className="role-note">
          <span className="role-note__dot" />
          <span>Режим: <b>{role === 'seller' ? 'продавец' : 'покупатель'}</b></span>
          <span className="role-note__hint">Роль можно изменить в шапке</span>
        </section>

      {role === 'seller' ? (
        <SellerFlow
          auction={auction}
          screen={sellerScreen}
          startPrice={startPrice}
          step={step}
          endDate={endDate}
          formError={formError}
          progress={progress}
          onStartPrice={setStartPrice}
          onStep={setStep}
          onEndDate={setEndDate}
          onCheck={checkAuction}
          onEdit={() => { setSellerScreen('setup'); reachMetrikaGoal(AUCTION_GOALS.sellerConditionsEdited, { step: 'seller-review', role: 'seller' }) }}
          onPublish={publishAuction}
          onViewBuyer={goToBuyerCard}
        />
      ) : (
        <BuyerFlow
          auction={auction}
          screen={buyerScreen}
          bidValue={bidValue}
          bidStatus={bidStatus}
          minimumBid={minimumBid}
          bidHint={bidHint}
          onOpen={() => { setBuyerScreen('card'); reachMetrikaGoal(AUCTION_GOALS.buyerLotOpened, { step: 'buyer-feed', role: 'buyer' }) }}
          onBack={() => { setBuyerScreen('feed'); reachMetrikaGoal(AUCTION_GOALS.buyerBackToList, { step: 'buyer-card', role: 'buyer' }) }}
          onGoToSeller={goToSellerSetup}
          onBidValue={(value) => {
            setBidValue(value.replace(/[^0-9]/g, ''))
            if (bidStatus !== 'pending') setBidStatus('idle')
          }}
          onBid={submitBid}
        />
      )}

      <section className="demo-area" aria-label="Инструменты проверки">
        <button className="demo-trigger" aria-expanded={isDemoOpen} onClick={() => setIsDemoOpen((current) => !current)}>
          {isDemoOpen ? 'Скрыть проверку состояний' : 'Проверить состояния ставки'}
        </button>
        {isDemoOpen && <aside className="demo-panel" aria-label="Панель демонстрации">
          <div className="demo-panel__header"><span>Проверка состояний</span><small>инструмент прототипа</small></div>
          <div className="demo-panel__controls">
            <label>Ответ на ставку
              <select value={demoResponse} onChange={(event) => setDemoResponse(event.target.value as DemoResponse)}>
                <option value="accepted">Принять ставку</option>
                <option value="error">Вернуть ошибку</option>
              </select>
            </label>
            <button className="demo-panel__finish" disabled={auction.status !== 'published'} onClick={() => { setAuction((current) => ({ ...current, status: 'finished' })); reachMetrikaGoal(AUCTION_GOALS.auctionFinished, { step: 'demo-panel', role: role as MetrikaRole, result: 'success' }) }}>
              Завершить аукцион
            </button>
          </div>
          <button className="demo-panel__reset" onClick={resetDemo}>Сбросить демо</button>
        </aside>}
      </section>
      </>}
    </main>
  )
}

type SellerFlowProps = {
  auction: Auction
  screen: SellerScreen
  startPrice: string
  step: string
  endDate: string
  formError: string
  progress: number
  onStartPrice: (value: string) => void
  onStep: (value: string) => void
  onEndDate: (value: string) => void
  onCheck: (event: FormEvent) => void
  onEdit: () => void
  onPublish: () => void
  onViewBuyer: () => void
}

function SellerFlow(props: SellerFlowProps) {
  const { auction, screen, startPrice, step, endDate, formError, progress, onStartPrice, onStep, onEndDate, onCheck, onEdit, onPublish, onViewBuyer } = props
  if (screen === 'published') {
    return (
      <section className="screen seller-published">
        <div className="success-icon">✓</div>
        <p className="eyebrow">Аукцион опубликован</p>
        <h1>{auction.status === 'finished' ? 'Аукцион завершён' : 'Квартира ждёт ставки'}</h1>
        <p className="muted">{auction.status === 'finished' ? `Финальная ставка — ${formatPrice(auction.currentPrice)}` : 'Покупатели уже могут открыть карточку и сделать ставку.'}</p>
        <div className="published-card"><BuildingArtwork /><div><b>{apartment.title}</b><span>до {formatDate(auction.endDate)}</span></div></div>
        <div className={`auction-status auction-status--${auction.status}`}>
          <span className="status-dot" />
          {auction.status === 'finished' ? 'Приём ставок завершён' : 'Аукцион идёт'}
        </div>
        {auction.status === 'published' && <button className="secondary-button" onClick={onViewBuyer}>Посмотреть карточку покупателя <Arrow /></button>}
      </section>
    )
  }

  if (screen === 'review') {
    return (
      <section className="screen">
        <button className="back-link" onClick={onEdit}><Arrow direction="left" /> Изменить условия</button>
        <p className="eyebrow">Шаг 2 из 2</p>
        <h1>Проверьте условия</h1>
        <p className="muted">После публикации они появятся в карточке квартиры.</p>
        <div className="property-card property-card--compact"><BuildingArtwork /><div><b>{apartment.title}</b><span>{apartment.address}</span></div></div>
        <dl className="review-list">
          <div><dt>Стартовая цена</dt><dd>{formatPrice(auction.startPrice)}</dd></div>
          <div><dt>Минимальный шаг</dt><dd>{formatPrice(auction.step)}</dd></div>
          <div><dt>Окончание</dt><dd>{formatDate(auction.endDate)}</dd></div>
        </dl>
        <button className="primary-button" onClick={onPublish}>Опубликовать аукцион <Arrow /></button>
        <p className="caption">Оплата и оформление сделки — после завершения аукциона.</p>
      </section>
    )
  }

  return (
    <section className="screen">
      <div className="stepper" aria-label="Этап 1 из 2"><span className={progress >= 0 ? 'done' : ''}>1</span><i /><span>2</span></div>
      <p className="eyebrow">Новый способ продажи</p>
      <h1>Настройте аукцион</h1>
      <p className="muted">Покупатели будут делать ставки в карточке вашей квартиры.</p>
      <div className="property-card"><BuildingArtwork /><div><b>{apartment.title}</b><span>{apartment.address}</span></div></div>
      <form onSubmit={onCheck} className="auction-form">
        <label>Стартовая цена, ₽<input inputMode="numeric" value={startPrice} onChange={(event) => onStartPrice(event.target.value.replace(/[^0-9]/g, ''))} /></label>
        <label>Минимальный шаг ставки, ₽<input inputMode="numeric" value={step} onChange={(event) => onStep(event.target.value.replace(/[^0-9]/g, ''))} /></label>
        <label>Дата окончания<input type="date" value={endDate} onChange={(event) => onEndDate(event.target.value)} /></label>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="primary-button" type="submit">Проверить условия <Arrow /></button>
      </form>
      <p className="caption">Условия можно изменить до публикации.</p>
    </section>
  )
}

type BuyerFlowProps = {
  auction: Auction
  screen: BuyerScreen
  bidValue: string
  bidStatus: BidStatus
  minimumBid: number
  bidHint: string
  onOpen: () => void
  onBack: () => void
  onGoToSeller: () => void
  onBidValue: (value: string) => void
  onBid: (event: FormEvent) => void
}

function BuyerFlow(props: BuyerFlowProps) {
  const { auction, screen, bidValue, bidStatus, minimumBid, bidHint, onOpen, onBack, onGoToSeller, onBidValue, onBid } = props
  if (auction.status === 'draft') {
    return <section className="screen empty-state"><AuctionEmptyArtwork /><h1>Аукцион ещё не опубликован</h1><p className="muted">Продавец настраивает условия. Переключитесь на роль продавца, чтобы опубликовать лот.</p><button className="secondary-button" onClick={onGoToSeller}>Перейти к настройке <Arrow /></button></section>
  }
  if (screen === 'feed') {
    return (
      <section className="screen">
        <p className="eyebrow">Аукционы квартир</p>
        <h1>Новая квартира на торгах</h1>
        <button className="listing-card" onClick={onOpen}>
          <BuildingArtwork />
          <span className="listing-card__content"><b>{apartment.title}</b><small>{apartment.address}</small><em>{auction.status === 'finished' ? 'Аукцион завершён' : `Ставка от ${formatPrice(auction.currentPrice + auction.step)}`}</em></span>
          <Arrow />
        </button>
        <p className="caption">Нажмите на карточку, чтобы узнать условия аукциона.</p>
      </section>
    )
  }
  return (
    <section className="screen buyer-card">
      <button className="back-link" onClick={onBack}><Arrow direction="left" /> К аукционам</button>
      <BuildingArtwork />
      <div className="buyer-card__title"><div><p className="eyebrow">{auction.status === 'finished' ? 'Аукцион завершён' : 'Аукцион идёт'}</p><h1>{apartment.title}</h1><p className="muted">{apartment.address}</p></div><span className={`auction-pill ${auction.status === 'finished' ? 'auction-pill--finished' : ''}`}>{auction.status === 'finished' ? 'Завершён' : 'Торги'}</span></div>
      <div className="feature-row">{apartment.features.map((feature) => <span key={feature}>{feature}</span>)}</div>
      <section className="terms-card"><h2>Условия аукциона</h2><div><span>Текущая ставка</span><b>{formatPrice(auction.currentPrice)}</b></div><div><span>Шаг ставки</span><b>{formatPrice(auction.step)}</b></div><div><span>Завершится</span><b>{formatDate(auction.endDate)}</b></div></section>
      {auction.status === 'finished' ? <FinishedCard price={auction.currentPrice} /> : <BidForm bidValue={bidValue} bidStatus={bidStatus} minimumBid={minimumBid} bidHint={bidHint} onBidValue={onBidValue} onBid={onBid} />}
    </section>
  )
}

function BidForm({ bidValue, bidStatus, minimumBid, bidHint, onBidValue, onBid }: {
  bidValue: string
  bidStatus: BidStatus
  minimumBid: number
  bidHint: string
  onBidValue: (value: string) => void
  onBid: (event: FormEvent) => void
}) {
  const isPending = bidStatus === 'pending'
  return (
    <form className="bid-box" onSubmit={onBid}>
      <h2>Сделать ставку</h2>
      <label>Ваша ставка, ₽<input className={bidHint || bidStatus === 'below-minimum' ? 'input-error' : ''} inputMode="numeric" placeholder={formatPrice(minimumBid)} value={bidValue} disabled={isPending} onChange={(event) => onBidValue(event.target.value)} /></label>
      <p className={bidHint || bidStatus === 'below-minimum' ? 'bid-hint bid-hint--error' : 'bid-hint'}>{bidHint || `Минимум ${formatPrice(minimumBid)}`}</p>
      {bidStatus === 'pending' && <StatusMessage type="pending" />}
      {bidStatus === 'accepted' && <StatusMessage type="accepted" />}
      {bidStatus === 'error' && <StatusMessage type="error" />}
      <button className="primary-button" disabled={isPending} type="submit">{isPending ? 'Отправляем ставку…' : 'Сделать ставку'}</button>
    </form>
  )
}

function StatusMessage({ type }: { type: 'pending' | 'accepted' | 'error' }) {
  const messages = {
    pending: ['status-message--pending', 'Проверяем ставку', 'Это займёт несколько секунд.'],
    accepted: ['status-message--accepted', 'Ставка принята', 'Ваша ставка сейчас лидирует.'],
    error: ['status-message--error', 'Не удалось принять ставку', 'Попробуйте ещё раз.'],
  } as const
  const [className, title, text] = messages[type]
  return <div className={`status-message ${className}`} role="status"><b>{title}</b><span>{text}</span></div>
}

function FinishedCard({ price }: { price: number }) {
  return <section className="finished-card"><span>✓</span><div><h2>Аукцион завершён</h2><p>Финальная ставка: <b>{formatPrice(price)}</b></p></div></section>
}

export default App
