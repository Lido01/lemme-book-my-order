import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, UserPlus } from "lucide-react";

import AuthShell from "../components/account/AuthShell";
import {
  INPUT,
  LABEL,
  PRIMARY_BUTTON,
} from "../components/account/authStyles";
import Alert from "../components/ui/Alert";
import FieldError from "../components/ui/FieldError";
import Spinner from "../components/ui/Spinner";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * Customer registration — creates customer account and logs them in directly
 */
export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { signUp, isAuthenticated } = useCustomerAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from || "/#testimonials";

  const update = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));

  const fillSample = () => {
    setForm({
      username: "lidetu",
      email: "lidosinafanis@gmail.com",
      firstName: "Lidetu",
      lastName: "Tesfaye",
      phone: "+251911223344",
      password: "password123",
      passwordConfirm: "password123",
    });
    setError(null);
  };

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signUp(form);
      navigate(destination, { replace: true });
    } catch (apiError) {
      setError(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t("account.eyebrow")}
      title={t("account.signUpTitle")}
      lead={t("account.signUpLead")}
      footer={
        <p className="text-center text-sm text-white/50">
          {t("account.haveAccount")}{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-semibold text-[#d6a85f] transition hover:text-[#e5bd7a]"
          >
            {t("account.signInInstead")}
          </Link>
        </p>
      }
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-5 border border-white/10 bg-[#111] p-5 sm:p-7 rounded-2xl"
      >
        {/* Quick Sample Fill */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
          <span className="text-xs text-white/60 flex items-center gap-1.5">
            <UserPlus size={13} className="text-[#d6a85f]" />
            <span>Sample Account</span>
          </span>
          <button
            type="button"
            onClick={fillSample}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#d6a85f] hover:text-[#e5bd7a] transition cursor-pointer"
          >
            <Sparkles size={12} />
            <span>Fill Sample Details</span>
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="register-username">
              {t("account.form.username")}
            </label>

            <input
              id="register-username"
              value={form.username}
              onChange={update("username")}
              placeholder="e.g. lidetu"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              disabled={submitting}
              className={INPUT}
            />

            <FieldError message={error?.fieldErrors?.username} />
          </div>

          <div>
            <label className={LABEL} htmlFor="register-email">
              {t("account.form.email")}
            </label>

            <input
              id="register-email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="e.g. name@example.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              disabled={submitting}
              className={INPUT}
            />

            <FieldError message={error?.fieldErrors?.email} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="register-first-name">
              {t("account.form.firstName")}
            </label>

            <input
              id="register-first-name"
              value={form.firstName}
              onChange={update("firstName")}
              placeholder="First name"
              autoComplete="given-name"
              disabled={submitting}
              className={INPUT}
            />

            <FieldError message={error?.fieldErrors?.first_name} />
          </div>

          <div>
            <label className={LABEL} htmlFor="register-last-name">
              {t("account.form.lastName")}
            </label>

            <input
              id="register-last-name"
              value={form.lastName}
              onChange={update("lastName")}
              placeholder="Last name"
              autoComplete="family-name"
              disabled={submitting}
              className={INPUT}
            />

            <FieldError message={error?.fieldErrors?.last_name} />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="register-phone">
            {t("account.form.phone")}
          </label>

          <input
            id="register-phone"
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="+251 91 123 4567"
            autoComplete="tel"
            disabled={submitting}
            className={INPUT}
          />

          <FieldError message={error?.fieldErrors?.phone} />
        </div>

        <div>
          <label className={LABEL} htmlFor="register-password">
            {t("account.form.password")}
          </label>

          <input
            id="register-password"
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            disabled={submitting}
            aria-describedby="register-password-hint"
            className={INPUT}
          />

          <p
            id="register-password-hint"
            className="mt-2 text-[11px] leading-5 text-white/40"
          >
            {t("account.form.passwordHint")}
          </p>

          <FieldError message={error?.fieldErrors?.password} />
        </div>

        <div>
          <label className={LABEL} htmlFor="register-password-confirm">
            {t("account.form.passwordConfirm")}
          </label>

          <input
            id="register-password-confirm"
            type="password"
            value={form.passwordConfirm}
            onChange={update("passwordConfirm")}
            placeholder="Repeat your password"
            autoComplete="new-password"
            disabled={submitting}
            className={INPUT}
          />

          <FieldError message={error?.fieldErrors?.passwordConfirm} />
        </div>

        {error && (
          <Alert tone="error" title={t("account.form.errorTitle")}>
            {error.message || "Registration failed. Please check the fields above."}
          </Alert>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={PRIMARY_BUTTON}
        >
          {submitting ? (
            <>
              <Spinner size={15} label={t("account.form.submitting")} />
              <span>Creating account...</span>
            </>
          ) : (
            t("account.form.submitSignUp")
          )}
        </button>
      </form>
    </AuthShell>
  );
}
