import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, ShieldCheck, User } from "lucide-react";

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
 * Customer sign-in — POST /api/accounts/login/ or Standalone store
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { signIn, isAuthenticated } = useCustomerAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from || "/#testimonials";

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const fillDemoCustomer = () => {
    setUsername("customer");
    setPassword("password123");
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signIn({ username, password });
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
      title={t("account.signInTitle")}
      lead={t("account.signInLead")}
      footer={
        <div className="space-y-3 text-center text-sm text-white/50">
          <p>
            {t("account.noAccount")}{" "}
            <Link
              to="/register"
              state={location.state}
              className="font-semibold text-[#d6a85f] transition hover:text-[#e5bd7a]"
            >
              {t("account.createOne")}
            </Link>
          </p>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/40">
              Are you staff or shop manager?{" "}
              <Link
                to="/admin/login"
                className="font-medium text-[#d6a85f] transition hover:text-[#e5bd7a] inline-flex items-center gap-1"
              >
                <ShieldCheck size={13} />
                <span>Go to Staff Console →</span>
              </Link>
            </p>
          </div>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-5 border border-white/10 bg-[#111] p-5 sm:p-7 rounded-2xl"
      >
        {/* Quick Demo Fill Pill */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
          <span className="text-xs text-white/60 flex items-center gap-1.5">
            <User size={13} className="text-[#d6a85f]" />
            <span>Customer Demo</span>
          </span>
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#d6a85f] hover:text-[#e5bd7a] transition cursor-pointer"
          >
            <Sparkles size={12} />
            <span>Fill Demo Credentials</span>
          </button>
        </div>

        <div>
          <label className={LABEL} htmlFor="customer-username">
            {t("account.form.username")}
          </label>

          <input
            id="customer-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="e.g. customer or your username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            disabled={submitting}
            className={INPUT}
          />

          <FieldError message={error?.fieldErrors?.username} />
        </div>

        <div>
          <label className={LABEL} htmlFor="customer-password">
            {t("account.form.password")}
          </label>

          <input
            id="customer-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={submitting}
            className={INPUT}
          />

          <FieldError message={error?.fieldErrors?.password} />
        </div>

        {error && (
          <Alert tone="error" title={t("account.form.errorTitle")}>
            {error.message || "Invalid credentials. Please verify your username and password."}
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
              <span>Signing in...</span>
            </>
          ) : (
            t("account.form.submitSignIn")
          )}
        </button>
      </form>
    </AuthShell>
  );
}
