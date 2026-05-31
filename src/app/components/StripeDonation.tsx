// ─────────────────────────────────────────────────────────────
// HSS UK — Stripe-style Donation Page
// ─────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import {
  Heart,
  Lock,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import hssLogoColour from '../../assets/brand/hss/logos/hss-logo-colour.png';

// ── Preset amounts ────────────────────────────────────────────
const PRESET_AMOUNTS = [5, 10, 25, 50, 100, 250];

// ── Helpers ───────────────────────────────────────────────────
function formatCardNumber(raw: string) {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function formatCvc(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 4);
}

// ── Card brand detector ───────────────────────────────────────
function detectBrand(num: string): 'visa' | 'mastercard' | 'amex' | null {
  const d = num.replace(/\s/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^5[1-5]/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  return null;
}

function CardBrandBadge({ brand }: { brand: 'visa' | 'mastercard' | 'amex' | null }) {
  if (!brand) return null;
  const labels: Record<string, string> = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX' };
  const colours: Record<string, string> = {
    visa:       'bg-blue-600 text-white',
    mastercard: 'bg-red-600 text-white',
    amex:       'bg-green-600 text-white',
  };
  return (
    <span className={`text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded ${colours[brand]}`}>
      {labels[brand]}
    </span>
  );
}

// ── Props ─────────────────────────────────────────────────────
interface StripeDonationProps {
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────
export default function StripeDonation({ onBack }: StripeDonationProps) {
  // Amount
  const [selectedPreset, setSelectedPreset] = useState<number | null>(25);
  const [customAmount, setCustomAmount]     = useState('');

  // Form fields
  const [email, setEmail]           = useState('');
  const [name, setName]             = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvc, setCvc]               = useState('');
  const [postcode, setPostcode]     = useState('');

  // UI state
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const cardRef = useRef<HTMLInputElement>(null);

  const amount = customAmount !== '' ? parseFloat(customAmount) : (selectedPreset ?? 0);
  const brand  = detectBrand(cardNumber);

  // ── Validation ────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (!name.trim()) e.name = 'Cardholder name required';
    if (cardNumber.replace(/\s/g, '').length < 13) e.card = 'Enter a valid card number';
    const [mm] = expiry.replace(/\s/g, '').split('/');
    if (!mm || mm.length < 2 || expiry.replace(/\s/g, '').length < 4) e.expiry = 'MM / YY required';
    if (cvc.length < 3) e.cvc = 'Enter CVC';
    if (!amount || amount < 1) e.amount = 'Enter a donation amount (min £1)';
    return e;
  }

  // ── Submit ────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  }

  // ── Success screen ────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Thank you, {name.split(' ')[0]}!
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-1 text-sm">
            Your donation of
          </p>
          <p className="text-4xl font-black text-primary-600 dark:text-primary-400 mb-4">
            £{amount.toFixed(2)}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
            has been received. A confirmation will be sent to <strong>{email}</strong>.
            <br />Your generosity helps HSS UK continue its seva activities.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Payment form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col">

      {/* ── Top bar (Stripe-style) ── */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <Lock className="w-3.5 h-3.5" />
          Secured by Stripe
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6">

          {/* ── Left panel: Organisation summary ── */}
          <div className="lg:w-[38%] space-y-6">
            {/* Org card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <img src={hssLogoColour} alt="HSS UK" className="h-10 w-auto" />
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">Hindu Swayamsevak Sangh UK</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Registered Charity</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Your donation supports our cultural, educational, and community service activities across the UK.
                Every contribution makes a meaningful difference.
              </p>
            </div>

            {/* Amount selector */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Select donation amount
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESET_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedPreset(amt); setCustomAmount(''); setErrors(e => ({ ...e, amount: '' })); }}
                    className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      selectedPreset === amt && customAmount === ''
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-400'
                    }`}
                  >
                    £{amt}
                  </button>
                ))}
              </div>
              {/* Custom amount */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium text-sm">£</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Other amount"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setSelectedPreset(null); setErrors(err => ({ ...err, amount: '' })); }}
                  className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${
                    errors.amount ? 'border-red-400 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}

              {amount > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Donation total</span>
                    <span className="font-bold text-neutral-900 dark:text-white">£{amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-3 px-2">
              <Shield className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                256-bit SSL encryption. Your payment details are never stored on our servers.
              </p>
            </div>
          </div>

          {/* ── Right panel: Payment form ── */}
          <div className="lg:w-[62%]">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">Payment Details</h2>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">All fields are required</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(err => ({ ...err, email: '' })); }}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${
                      errors.email ? 'border-red-400 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Card number */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Card number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      ref={cardRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setErrors(err => ({ ...err, card: '' })); }}
                      className={`w-full pl-9 pr-16 py-2.5 rounded-lg border text-sm font-mono bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${
                        errors.card ? 'border-red-400 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CardBrandBadge brand={brand} />
                    </div>
                  </div>
                  {errors.card && <p className="text-xs text-red-500 mt-1">{errors.card}</p>}
                </div>

                {/* Expiry + CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Expiry date</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={e => { setExpiry(formatExpiry(e.target.value)); setErrors(err => ({ ...err, expiry: '' })); }}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm font-mono bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${
                        errors.expiry ? 'border-red-400 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    />
                    {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">CVC / CVV</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="•••"
                        value={cvc}
                        onChange={e => { setCvc(formatCvc(e.target.value)); setErrors(err => ({ ...err, cvc: '' })); }}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm font-mono bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${
                          errors.cvc ? 'border-red-400 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      />
                    </div>
                    {errors.cvc && <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>}
                  </div>
                </div>

                {/* Cardholder name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Cardholder name</label>
                  <input
                    type="text"
                    placeholder="Name as it appears on card"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(err => ({ ...err, name: '' })); }}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${
                      errors.name ? 'border-red-400 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Postcode */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Billing postcode</label>
                  <input
                    type="text"
                    placeholder="e.g. SW1A 1AA"
                    value={postcode}
                    onChange={e => setPostcode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Gift Aid */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer hover:border-amber-300 transition-colors">
                  <input type="checkbox" className="mt-0.5 accent-primary-600 w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Boost my donation by 25% with Gift Aid 🇬🇧
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                      I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations, it is my responsibility to pay any difference.
                    </p>
                  </div>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {amount > 0 ? `Donate £${amount.toFixed(2)}` : 'Donate'}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Footer note */}
                <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
                  By donating you agree to our{' '}
                  <span className="underline cursor-pointer">Terms</span> and{' '}
                  <span className="underline cursor-pointer">Privacy Policy</span>.
                  Powered by{' '}
                  <span className="font-semibold text-[#635bff]">stripe</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
