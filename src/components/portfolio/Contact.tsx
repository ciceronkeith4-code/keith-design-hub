import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { SiGmail, SiGithub } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";

interface SocialLink {
  id: string;
  label: string;
  handle: string;
  url: string;
  icon: typeof SiGmail;
  external: boolean;
}

// Kept to the three links a recruiter or client actually needs: email, LinkedIn, GitHub.
const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "Keith Ciceron",
    url: "https://www.linkedin.com/in/keith-ciceron",
    icon: FaLinkedinIn,
    external: true,
  },
  {
    id: "gmail",
    label: "Gmail",
    handle: "ciceronkeith4@gmail.com",
    url: "mailto:ciceronkeith4@gmail.com",
    icon: SiGmail,
    external: false,
  },
  {
    id: "github",
    label: "GitHub",
    handle: "@ciceronkeith4-code",
    url: "https://github.com/ciceronkeith4-code/ciceronkeith4-code",
    icon: SiGithub,
    external: true,
  },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    botcheck: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const validate = () => {
    const nextErrors: { name?: string; email?: string; message?: string } = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim()) {
      nextErrors.message = "Message is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const accessKey =
        (import.meta.env.VITE_WEB3FORMS_KEY as string | undefined) ||
        "test-access-key";

      const payload = {
        access_key: accessKey,
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject:
          formData.subject.trim() ||
          `Portfolio Contact from ${formData.name.trim()}`,
        message: formData.message.trim(),
        from_name: "Keith Ciceron Portfolio",
        botcheck: formData.botcheck ? "true" : "",
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (response.ok && data.success) {
        setStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully.",
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          botcheck: false,
        });
      } else {
        setStatus({
          type: "error",
          message:
            data.message ||
            "Unable to send your message right now. Please try reaching out via email or phone.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message:
          "Network error. Please try reaching out directly via email or phone.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col text-left">
      <h2 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Get in Touch
      </h2>

      {/* Primary Focal Point: Message Form Card */}
      <div className="rounded-[16px] sm:rounded-[20px] border border-[#E5E5E0] dark:border-[#262626] bg-[#F6F7F4] dark:bg-[#141414] p-5 sm:p-7 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <input
            type="checkbox"
            name="botcheck"
            className="hidden"
            style={{ display: "none" }}
            checked={formData.botcheck}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, botcheck: e.target.checked }))
            }
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Name + Email Fields, side by side on wider screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="font-mono text-[10px] text-[#62655E] dark:text-[#A3A3A3] uppercase tracking-wider block mb-1.5"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your full name"
                className={`w-full rounded-[8px] border bg-white dark:bg-[#1C1C1C] px-3 py-2 text-base sm:text-sm text-[#161616] dark:text-[#EDEDED] placeholder-[#71746C] dark:placeholder-[#8A8D86] focus:outline-none transition-colors ${
                  errors.name
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#E5E5E0] dark:border-[#262626] focus:border-[#161616] dark:focus:border-[#EDEDED]"
                }`}
              />
              {errors.name && (
                <p className="font-mono text-[10px] text-red-500 mt-0.5">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="font-mono text-[10px] text-[#62655E] dark:text-[#A3A3A3] uppercase tracking-wider block mb-1.5"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="your.email@example.com"
                className={`w-full rounded-[8px] border bg-white dark:bg-[#1C1C1C] px-3 py-2 text-base sm:text-sm text-[#161616] dark:text-[#EDEDED] placeholder-[#71746C] dark:placeholder-[#8A8D86] focus:outline-none transition-colors ${
                  errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#E5E5E0] dark:border-[#262626] focus:border-[#161616] dark:focus:border-[#EDEDED]"
                }`}
              />
              {errors.email && (
                <p className="font-mono text-[10px] text-red-500 mt-0.5">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label
              htmlFor="contact-subject"
              className="font-mono text-[10px] text-[#62655E] dark:text-[#A3A3A3] uppercase tracking-wider block mb-1.5"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Project inquiry, role, or collaboration"
              className="w-full rounded-[8px] border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#1C1C1C] px-3 py-2 text-base sm:text-sm text-[#161616] dark:text-[#EDEDED] placeholder-[#71746C] dark:placeholder-[#8A8D86] focus:border-[#161616] dark:focus:border-[#EDEDED] focus:outline-none transition-colors"
            />
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="contact-message"
              className="font-mono text-[10px] text-[#62655E] dark:text-[#A3A3A3] uppercase tracking-wider block mb-1.5"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="contact-message"
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Describe your inquiry or idea..."
              className={`w-full rounded-[8px] border bg-white dark:bg-[#1C1C1C] px-3 py-2 text-base sm:text-sm text-[#161616] dark:text-[#EDEDED] placeholder-[#71746C] dark:placeholder-[#8A8D86] focus:outline-none transition-colors resize-none ${
                errors.message
                  ? "border-red-400 focus:border-red-500"
                  : "border-[#E5E5E0] dark:border-[#262626] focus:border-[#161616] dark:focus:border-[#EDEDED]"
              }`}
            />
            {errors.message && (
              <p className="font-mono text-[10px] text-red-500 mt-0.5">{errors.message}</p>
            )}
          </div>

          {/* Status Feedback */}
          {status && (
            <div
              className={`rounded-[8px] p-2 text-xs font-mono ${
                status.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Submit Button Row */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#2E2E2E] dark:hover:bg-white disabled:opacity-60 disabled:cursor-wait px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer shrink-0"
            >
              <span>{loading ? "Sending…" : "Send Message"}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Socials on the Bottom */}
      <div className="mt-6 flex flex-col items-start gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {SOCIAL_LINKS.map((social) => {
            const Icon = social.icon;
            return (
              <div key={social.id} className="relative group">
                <a
                  href={social.url}
                  {...(social.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  title={`${social.label}: ${social.handle}`}
                  aria-label={`${social.label} (${social.handle})`}
                  className="h-10 w-10 sm:h-9 sm:w-9 rounded-full bg-white dark:bg-[#141414] border border-[#E5E5E0] dark:border-[#262626] text-[#161616] dark:text-[#EDEDED] hover:bg-[#161616] hover:text-white dark:hover:bg-white dark:hover:text-[#161616] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 rounded-[6px] bg-[#1C1C1C] dark:bg-[#262626] border border-white/10 px-2.5 py-1 text-xs font-sans text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-50 shadow-md">
                  <span className="font-medium">{social.label}</span>
                  <span className="text-white/60 ml-1.5 font-mono text-[10px]">{social.handle}</span>
                </span>
              </div>
            );
          })}
        </div>

        <p className="font-sans text-xs text-[#62655E] dark:text-[#A3A3A3]">
          Manila, Philippines
        </p>
      </div>
    </div>
  );
}
